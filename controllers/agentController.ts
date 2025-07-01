import { Request, Response } from "express"
import pool from "../config/config-db"

export const getAgentsByCompany = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.person_id // ya no uses req.session
    console.log("👤 Usuario en req.user:", req.user);

    if (!adminId) {
      return res.status(401).json({ error: "No autorizado: token no válido" })
    }

    const [rows]: any = await pool.query("CALL GetAgentsByAdmin(?)", [adminId])
    res.json(rows[0])
  } catch (error) {
    console.error("Error al obtener agentes:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

