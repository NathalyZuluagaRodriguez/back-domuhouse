import db from "../config/config-db"
import nodemailer from "nodemailer"
import { RowDataPacket } from "mysql2/promise"

/* ──────────────────────────────────────────────────────────────
   🔧 Configuración de transporte de correo
────────────────────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

/* ──────────────────────────────────────────────────────────────
   📦 Servicio de mensajes
────────────────────────────────────────────────────────────── */
class MessageService {
  /* 1. Mensajes enviados por un agente */
  static async getMessagesByAgent(agentPersonId: number, limit = 20) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100))
    const sql = `
      SELECT
        m.id_message, m.content, m.date,
        m.id_sender, m.id_receiver,
        r.name_person AS receiverName,
        r.last_name   AS receiverLastName,
        r.email       AS receiverEmail,
        r.phone       AS receiverPhone
      FROM message m
      JOIN person r ON m.id_receiver = r.person_id
      WHERE m.id_sender = ?
      ORDER BY m.date DESC
      LIMIT ${safeLimit};
    `
    const [rows] = await db.execute<RowDataPacket[]>(sql, [agentPersonId])
    return rows
  }

  /* 2. Envía correo y guarda mensaje (con IDs) */
  static async sendEmail(
    senderId: number,
    receiverId: number,
    subject: string,
    content: string
  ) {
    // 1. Datos del receptor
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT email, CONCAT(name_person,' ',last_name) AS name
       FROM Person WHERE person_id = ?`, [receiverId]
    )
    if (!rows.length) throw new Error("Receptor no encontrado")
    const { email, name } = rows[0]

    // 2. Enviar correo (best‑effort)
    await this._trySendMail(email, name, subject, content)

    // 3. Guardar mensaje (sin subject en DB)
    const [result]: any = await db.execute(
      `INSERT INTO message (content, date, id_sender, id_receiver)
       VALUES (?, NOW(), ?, ?)`,
      [content, senderId, receiverId]
    )
    return result.insertId
  }

  /* 3. Envía correo y guarda mensaje (con emails) */
  static async sendEmailByEmail(
    senderEmail: string,
    receiverEmail: string,
    subject: string,
    content: string
  ) {
    // 1. Resolver IDs
    const [[sender]] = await db.execute<RowDataPacket[]>(
      "SELECT person_id FROM Person WHERE email = ?", [senderEmail]
    )
    if (!sender) throw new Error("Remitente no encontrado")

    const [[receiver]] = await db.execute<RowDataPacket[]>(
      `SELECT person_id,
              CONCAT(name_person,' ',last_name) AS fullName
       FROM Person WHERE email = ?`, [receiverEmail]
    )
    if (!receiver) throw new Error("Receptor no encontrado")

    // 2. Enviar correo y guardar
    return this._sendAndStore(
      sender.person_id,
      receiver.person_id,
      receiverEmail,
      receiver.fullName,
      subject,
      content
    )
  }

  /* 4. Guarda mensaje sin enviar correo */
  static async saveMessage(
    senderId: number,
    receiverId: number,
    content: string
  ) {
    const [result]: any = await db.execute(
      `INSERT INTO message (content, date, id_sender, id_receiver)
       VALUES (?, NOW(), ?, ?)`,
      [content, senderId, receiverId]
    )
    return result.insertId
  }

  /* 🔐 Helpers -------------------------------------------------- */
  private static async _trySendMail(
    email: string,
    name: string,
    subject: string,
    content: string
  ) {
    try {
      await transporter.sendMail({
        from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject || "Nuevo mensaje de DomuHouse",
        text: `Hola ${name},\n\n${content}`
      })
    } catch (e) {
      console.error("SMTP error (se continúa guardando):", e)
    }
  }

  private static async _sendAndStore(
    senderId: number,
    receiverId: number,
    receiverEmail: string,
    receiverName: string,
    subject: string,
    content: string
  ) {
    await this._trySendMail(receiverEmail, receiverName, subject, content)

    const [result]: any = await db.execute(
      `INSERT INTO message (content, date, id_sender, id_receiver)
       VALUES (?, NOW(), ?, ?)`,
      [content, senderId, receiverId]
    )
    return result.insertId
  }
}

export default MessageService
