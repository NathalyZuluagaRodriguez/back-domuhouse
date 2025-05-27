import { Router } from 'express';
import {
  createProperty,
  editProperty,
  deleteProperty,
  approveProperty,
  getProperties,
  getApprovedProperties
} from '../controllers/propertyController';

const router = Router();

router.post('/', createProperty);
router.put('/:id', editProperty);
router.delete('/:id', deleteProperty);
router.put('/aprobar/:id', approveProperty);
router.get('/', getProperties);
router.get('/aprobadas', getApprovedProperties);


export default router;