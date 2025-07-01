import db from "../config/config-db"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App‑password de Gmail
  },
})

class MessageService {
  /**
   * Envía un correo al cliente y guarda el registro en la tabla Message.
   */
  static async sendEmail(
    senderId: number,
    receiverId: number,
    subject: string,
    content: string,
  ) {
    // 1. Traer el email y nombre del destinatario
    const [rows]: any = await db.execute(
      `SELECT email, CONCAT(name_person,' ',last_name) AS name
       FROM Person
       WHERE person_id = ?`,
      [receiverId],
    )
    if (!rows.length) throw new Error("Cliente no encontrado")

    const { email, name } = rows[0]

    // 2. Enviar correo
    await transporter.sendMail({
      from: `"DomuHouse" <${process.env.MAIL_USER}>`,
      to: email,
      subject,
      text: content,
    })

    // 3. Registrar en la tabla Message
    const [result]: any = await db.execute(
      `INSERT INTO Message (content, id_sender, id_receiver)
       VALUES (?, ?, ?)`,
      [content, senderId, receiverId],
    )

    return result.insertId // id_message
  }

  /**
   * Guarda un mensaje sin enviarlo (por ejemplo, como anotación interna).
   */
  static async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
  ) {
    const [result]: any = await db.execute(
      `INSERT INTO Message (content, id_sender, id_receiver)
       VALUES (?, ?, ?)`,
      [content, senderId, receiverId],
    )
    return result.insertId
  }
}

export default MessageService
