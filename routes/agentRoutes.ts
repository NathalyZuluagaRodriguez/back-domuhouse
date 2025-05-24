import { Router } from 'express';
import db from '../config/config-db';
import registerAgent from "../controllers/registerAgentController";
import getPropertiesByAgent from "../controllers/propertyByController";
import getVentasAlquileres from "../controllers/getAlquileresVentaController";
import getAgentePerformanceById from "../controllers/getAlquileresVentaController";
import { getReporteDesempenoAgentes } from "../controllers/reportesController";

const router = Router();

router.post("/registro-agente", registerAgent);
router.get("/propiedades-agente/:id", getPropertiesByAgent);
router.get("/ventas-alquileres", getVentasAlquileres);
router.get("/reporte-desempeno-agentes", getReporteDesempenoAgentes);
router.get('/:id/historial', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT ha.id_actividad, ha.accion, ha.fecha_actividad, p.nombre, p.apellido
       FROM HistorialActividad ha
       JOIN Persona p ON ha.id_agente = p.id_persona
       WHERE ha.id_agente = ?`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
});



export default router;