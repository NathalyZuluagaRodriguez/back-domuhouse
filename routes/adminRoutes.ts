import { Router } from 'express';
import { registerAdmin, eliminarAdmin } from '../controllers/adminController';
import { createProperty } from '../controllers/propertyController';
import upload from '../middleware/upload';


const router = Router();

router.post('/registro', registerAdmin);
router.delete('/admin/eliminar', eliminarAdmin); // mejor semántica
router.post('/properties',upload.array('images', 10),createProperty)


export default router;