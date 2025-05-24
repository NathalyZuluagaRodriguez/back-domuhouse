import { Router } from 'express';
import { getReportePropiedades } from '../controllers/reportesPropController';

const router = Router();

// Ruta: /api/reportes/propiedades
router.get('/propiedades', getReportePropiedades);

export default router;
