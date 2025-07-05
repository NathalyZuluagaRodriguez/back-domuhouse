import express from 'express';
import pool from '../config/config-db'; // Asegúrate que este es tu archivo de conexión a la BD

const router = express.Router();

// ✅ Ruta para obtener la inmobiliaria asociada al administrador
router.get('/admin/:id/real-estate', async (req, res) => {
  const adminId = req.params.id;

  try {
    // Ejecutar el procedimiento almacenado
    const [rows]: any = await pool.query('CALL sp_get_real_estate_by_admin(?)', [adminId]);

    // Validar si hay resultados
    if (rows[0].length === 0) {
      return res.status(404).json({ message: 'Inmobiliaria no encontrada para este administrador.' });
    }

    // Devolver solo la primera inmobiliaria encontrada (una por admin)
    res.json(rows[0][0]);
  } catch (error) {
    console.error('Error al obtener datos de inmobiliaria:', error);
    res.status(500).json({ error: 'Error al obtener datos de inmobiliaria' });
  }
});

export default router;
