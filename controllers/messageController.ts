import { Request, Response } from "express"
import MessageService from "../services/messageServices"

/**
 * Envía un correo al cliente y registra el mensaje en la tabla Message.
 * Espera en el body: { senderId, receiverId, subject, content }
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, subject, content } = req.body

    if (!senderId || !receiverId || !subject || !content) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const messageId = await MessageService.sendEmail(
      senderId,
      receiverId,
      subject,
      content,
    )

    res.status(201).json({ message: "Correo enviado", messageId })
  } catch (error) {
    console.error("Error sendEmail:", error)
    res.status(500).json({ error: "No se pudo enviar el correo" })
  }
}

/**
 * Guarda un mensaje en la tabla Message sin enviarlo por correo.
 * Espera en el body: { senderId, receiverId, content }
 */
export const saveMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const messageId = await MessageService.saveMessage(
      senderId,
      receiverId,
      content,
    )

    res.status(201).json({ message: "Mensaje guardado", messageId })
  } catch (error) {
    console.error("Error saveMessage:", error)
    res.status(500).json({ error: "No se pudo guardar el mensaje" })
  }
}

/**Obtener los mensajes */
export const getMessagesByAgent = async (req: Request, res: Response) => {
  const agentPersonId = Number(req.params.agentId)   // ahora ES el person_id
  const limit = req.query.limit ? Number(req.query.limit) : 20

  if (!agentPersonId || Number.isNaN(agentPersonId)) {
    return res.status(400).json({ error: "agentId inválido o faltante" })
  }

  try {
    const messages = await MessageService.getMessagesByAgent(agentPersonId, limit)
    return res.status(200).json(messages)
  } catch (error) {
    console.error("Error getMessagesByAgent:", error)
    return res.status(500).json({ error: "No se pudieron obtener los mensajes" })
  }
}
