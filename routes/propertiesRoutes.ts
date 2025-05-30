import { Router } from 'express';
import upload from '../middleware/upload';

import {
  createProperty,
  editProperty,
  deleteProperty,
  approveProperty,
  getProperties,
  getApprovedProperties, 
  getPropertiesByType
} from '../controllers/propertyController';

const router = Router();

// RUTAS MÁS ESPECÍFICAS PRIMERO
router.put('/approve/:id', approveProperty);

router.get('/aprobadas', getApprovedProperties);
router.get('/tipo/:property_type_id', getPropertiesByType);
router.get('/', getProperties);

// Rutas con parámetros al final
router.post('/', upload.array('images', 10), createProperty);
router.put('/:id', editProperty);
router.delete('/:id', deleteProperty);

// Middleware de debug para esta ruta específica
router.use('/aprobar/:id', (req, res, next) => {
    console.log('🔍 Ruta /aprobar/:id alcanzada');
    console.log('Method:', req.method);
    console.log('Params:', req.params);
    console.log('ID recibido:', req.params.id);
    next();
});

export default router;