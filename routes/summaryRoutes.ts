// routes/summaryRoutes.ts
import { Router } from 'express';
import { getAgentsDashboard } from '../controllers/agentDashboardController';
import { validateToken } from '../middleware/authMiddleware';

const router = Router();

// Ruta para obtener resumen de agentes (dashboard)
router.get('/agentes-info', validateToken, getAgentsDashboard);

export default router;
