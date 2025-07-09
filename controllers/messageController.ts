import { Request, Response } from "express"
import MessageService from "../services/messageServices"

/* POST /api/messages   (IDs) */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, subject, content } = req.body
    if (!senderId || !receiverId || !content?.trim()) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const messageId = await MessageService.sendEmail(
      senderId,
      receiverId,
      subject?.trim() || "Nuevo mensaje de DomuHouse",
      content.trim()
    )

    return res.status(201).json({ message: "Correo enviado", messageId })
  } catch (error) {
    console.error("Error sendEmail:", error)
    return res.status(500).json({ error: "No se pudo enviar el correo" })
  }
}

/* POST /api/by-email   (emails) */
export const sendEmailByEmail = async (req: Request, res: Response) => {
  try {
    const { senderEmail, receiverEmail, subject, content } = req.body
    if (!senderEmail || !receiverEmail || !content?.trim()) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const messageId = await MessageService.sendEmailByEmail(
      senderEmail,
      receiverEmail,
      subject?.trim() || "Nuevo mensaje de DomuHouse",
      content.trim()
    )

    return res.status(201).json({ message: "Correo enviado", messageId })
  } catch (error) {
    console.error("Error sendEmailByEmail:", error)
    return res.status(500).json({ error: "No se pudo enviar el correo" })
  }
}

/* POST /api/messages/save   → sin correo */
export const saveMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const messageId = await MessageService.saveMessage(
      senderId,
      receiverId,
      content
    )

    return res.status(201).json({ message: "Mensaje guardado", messageId })
  } catch (error) {
    console.error("Error saveMessage:", error)
    return res.status(500).json({ error: "No se pudo guardar el mensaje" })
  }
}

/* GET /api/agents/:agentId/messages */
export const getMessagesByAgent = async (req: Request, res: Response) => {
  const agentPersonId = Number(req.params.agentId)
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
