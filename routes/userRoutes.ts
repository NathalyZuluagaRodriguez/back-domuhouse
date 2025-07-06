// routes/userRoutes.ts
import { Router, Request, Response } from 'express';
import { validateToken } from '../middleware/authMiddleware';
import db from '../config/config-db';

const router = Router();

router.get('/perfil', validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /perfil");
  console.log("🧠 req.user:", req.user);

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const userId = req.user.person_id;

    const sql = `
      SELECT 
        p.person_id AS id,
        p.name_person AS nombre,
        p.phone AS telefono,
        p.email AS correo,
        p.verified,
        p.active,
        (
          SELECT COUNT(*) FROM Property WHERE person_id = ?
        ) AS propiedadesPublicadas,
        (
          SELECT COUNT(*) FROM Property WHERE person_id = ? AND status = 'Vendida'
        ) AS propiedadesVendidas
      FROM Person p
      WHERE p.person_id = ?
    `;

    const [results] = await db.query(sql, [userId, userId, userId]);

    const rows = results as any[];

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const perfil = rows[0];

    res.status(200).json({
      success: true,
      data: {
        nombre: perfil.nombre,
        telefono: perfil.telefono,
        correo: perfil.correo,
        propiedadesPublicadas: perfil.propiedadesPublicadas,
        propiedadesVendidas: perfil.propiedadesVendidas,
      },
    });
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

export default router;
