import db from "../config/config-db"
import nodemailer from "nodemailer"
import { RowDataPacket } from "mysql2/promise"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App‑password de Gmail
  },
})

class MessageService {
  /** 🔹 Mensajes recibidos por un agente */
  static async getMessagesByAgent(agentPersonId: number, limit = 20) {
    // Validar y limitar el número de resultados
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100))

    const sql = `
      SELECT
        m.id_message,
        m.content,
        m.date,
        m.id_sender,
        m.id_receiver,
        r.name_person  AS receiverName,
        r.last_name    AS receiverLastName,
        r.email        AS receiverEmail,
        r.phone        AS receiverPhone
      FROM message m
      JOIN person r ON m.id_receiver = r.person_id
      WHERE m.id_sender = ?
      ORDER BY m.date DESC
      LIMIT ${safeLimit};
    `

    const [rows] = await db.execute<RowDataPacket[]>(sql, [agentPersonId])
    return rows
  }

  /** 🔹 Envía e‑mail y registra mensaje */
  static async sendEmail(
    senderId: number,
    receiverId: number,
    subject: string,
    content: string,
  ) {
    // 1. Email y nombre del destinatario
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT email, CONCAT(name_person,' ',last_name) AS name
       FROM Person
       WHERE person_id = ?`,
      [receiverId],
    )
    if (!rows.length) throw new Error("Cliente no encontrado")
    const { email, name } = rows[0]

    // 2. Intentar enviar correo
    try {
      await transporter.sendMail({
        from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        text: `Hola ${name},\n\n${content}`,
      })
    } catch (e) {
      console.error("Fallo SMTP, pero se guardará el mensaje:", e)
    }

    // 3. Registrar en tabla
    const [result]: any = await db.execute(
      `INSERT INTO message (content, date, id_sender, id_receiver)
       VALUES (?, NOW(), ?, ?)`,
      [content, senderId, receiverId],
    )
    return result.insertId
  }

  /** 🔹 Guarda mensaje sin enviar */
  static async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ) {
    const [result]: any = await db.execute(
      `INSERT INTO message (content, date, id_sender, id_receiver)
       VALUES (?, NOW(), ?, ?)`,
      [content, senderId, receiverId],
    )
    return result.insertId
  }
}

export default MessageService