import { Router } from 'express';
import pool from '../config/config-db'; // Asegúrate de que esta ruta apunta a tu archivo de conexión MySQL

const router = Router();

// Ruta para obtener propiedades por ID de administrador
router.get('/properties/admin/:adminId', async (req, res) => {
  const adminId = req.params.adminId;

  try {
    // Ejecutar procedimiento almacenado y forzar tipado para evitar error TS7053
    const [result] = await pool.query('CALL GetPropertiesByAdmin(?)', [adminId]) as any;

    // El primer array de resultados es lo que necesitamos
    const properties = result[0] || [];

    // Validación simple
    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: 'No se encontraron propiedades para este administrador.' });
    }

    res.json(properties);
  } catch (error) {
    console.error('Error al obtener propiedades del admin:', error);
    res.status(500).json({ error: 'Error del servidor al obtener propiedades.' });
  }
});

export default router;
