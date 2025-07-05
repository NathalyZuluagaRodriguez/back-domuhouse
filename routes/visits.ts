import { Router } from 'express';
import pool from '../config/config-db';

const router = Router();

router.get('/visits/by-agency', async (req, res) => {
  const { realEstateId, date } = req.query;

  if (!realEstateId || !date) {
    return res.status(400).json({ error: 'Se requiere realEstateId y date' });
  }

  try {
    // 👇 aquí el tipado explícito es la clave
    const [rows]: any = await pool.query('CALL sp_get_visits_by_agency_and_date(?, ?)', [realEstateId, date]);

    console.log('✅ Resultado del SP:', rows);

    if (!rows || !Array.isArray(rows[0])) {
      return res.status(404).json({ message: 'No se encontraron visitas' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener visitas:', error);
    res.status(500).json({ error: 'Error interno al obtener visitas' });
  }
});

export default router;
