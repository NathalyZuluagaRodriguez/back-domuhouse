import { Router } from 'express';
import db from '../config/config-db';
import multer from "multer";


import registerAgentWithToken from "../controllers/registerAgentController";
import getVentasAlquileres from "../controllers/getAlquileresVentaController";
import { getReporteDesempenoAgentes } from "../controllers/reportesController";
import { generateInvitation } from '../controllers/invitationController';
import { getAgentsByCompany } from "../controllers/agentController"; // 🆕
import { validateToken } from "../middleware/authMiddleware";  
import { createProperty, listPropertiesByAgent,listSalesAndRentals,getAgentPerformanceReport,getProperty,updateProperty,deleteProperty,} from "../controllers/propertyByAgentController";
import { listVisitsByAgent, scheduleVisit, changeVisitStatus, updateVisit, deleteVisit } from "../controllers/visitByAgentController";
import { getMessagesByAgent } from '../controllers/messageController';


const router = Router();
router.get("/agentes", validateToken, getAgentsByCompany);

const upload = multer({ dest: "uploads/" });           // tmp folder; Cloudinary se encarga después


/* Registro */
router.post("/registro-agente", registerAgentWithToken);
router.post('/generar-token', generateInvitation);

// Rutas basadas en ID de agente
// 0. Crear propiedad (con imágenes)
router.post(
  "/agents/:agentId/properties",
  upload.array("images", 10),     // <‑‑ aquí se procesan los archivos
  createProperty
);
router.get("/agents/:agentId/properties", listPropertiesByAgent);
router.get("/:agentId/sales-rentals", listSalesAndRentals);

/* CRUD puntual */
router.get("/agents/:agentId/properties/:propertyId", getProperty);
router.put("/agents/:agentId/properties/:propertyId", updateProperty);
router.delete("/agents/:agentId/properties/:propertyId", deleteProperty);

/* Visitas Agendadas*/
router.get("/agents/:agentId/visits", listVisitsByAgent);
router.patch("/visits/:id/status", changeVisitStatus) // confirmar / cancelar
router.put   ("/visits/:id",        updateVisit)      // editar
router.delete("/visits/:id",        deleteVisit)      // eliminar

/* Programar nueva visita */
router.post("/agents/:agentId/visits/schedule", scheduleVisit);

/* Reporte */
router.get("/agents/:agentId/performance", getAgentPerformanceReport);


/*Obtener mensajes por agente */
router.get("/agents/:agentId/messages", getMessagesByAgent)



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