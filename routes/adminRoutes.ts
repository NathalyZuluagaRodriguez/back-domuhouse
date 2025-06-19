import { Router } from 'express';
import { registerAdmin, eliminarAdmin } from '../controllers/adminController';
import { createProperty } from '../controllers/propertyController';
import upload from '../middleware/upload';


const router = Router();

router.post('/registerAdmin', registerAdmin);
router.delete('/eliminarAdmin', eliminarAdmin); // mejor semántica
router.post('/CreateProperties',upload.array('images', 10),createProperty)


export default router;