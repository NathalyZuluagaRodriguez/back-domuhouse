import { Request, Response } from 'express';
import db from '../config/config-db';

export const getAgentsDashboard = async (req: Request, res: Response) => {
  const adminId = req.user?.person_id;

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado o sin ID válido"
    });
  }

  console.log("🔍 Admin logueado con ID:", adminId);

  try {
    const [rows]: any = await db.query('CALL GetAgentsByAdmin(?);', [adminId]);
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error obteniendo lista de agentes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener lista de agentes' 
    });
  }
};