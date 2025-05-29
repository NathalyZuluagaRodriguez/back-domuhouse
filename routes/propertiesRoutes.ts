import { Router } from 'express';
import multer from 'multer';
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


router.post('/properties', upload.array('images', 10), createProperty); // máx. 10 imágenes
router.put('/:id', editProperty);
router.delete('/:id', deleteProperty);
router.put('/aprobar/:id', approveProperty);
router.get('/', getProperties);
router.get('/aprobadas', getApprovedProperties);
router.get('/tipo/:property_type_id', getPropertiesByType);
export default router;