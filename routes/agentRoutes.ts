import { Router } from 'express';
import db from '../config/config-db';
import registerAgentWithToken from "../controllers/registerAgentController";
// import getPropertiesByAgent from "../controllers/propertyByAgentController";
import getVentasAlquileres from "../controllers/getAlquileresVentaController";
// import getAgentePerformanceById from "../controllers/AgentPerformanceController";
import { getReporteDesempenoAgentes } from "../controllers/reportesController";
import { generateInvitation } from '../controllers/invitationController';
import { getAgentsByCompany } from "../controllers/agentController"; // 🆕
import { validateToken } from "../middleware/authMiddleware";  

import {
  listPropertiesByAgent,
  listSalesAndRentals,
  getAgentPerformanceReport,
} from "../controllers/propertyByAgentController";

const router = Router();
router.get("/agentes", validateToken, getAgentsByCompany);

router.post("/registro-agente", registerAgentWithToken);
router.post('/generar-token', generateInvitation);
// router.get("/propiedades-agente/:id", getPropertiesByAgent);

// Rutas basadas en ID de agente
router.get("/agents/:agentId/properties", listPropertiesByAgent);
router.get("/:agentId/sales-rentals", listSalesAndRentals);
router.get("/:agentId/performance", getAgentPerformanceReport);


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