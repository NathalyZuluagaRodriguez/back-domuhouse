import { Router } from 'express';
import { registerAdmin, eliminarAdmin } from '../controllers/adminController';
import { createProperty, getPropertiesForAdmin} from '../controllers/propertyController';
import upload from '../middleware/upload';
import { verifyToken } from '../middleware/VerifyToken';


const router = Router();

router.post('/registerAdmin', registerAdmin);
router.delete('/eliminarAdmin', eliminarAdmin); // mejor semántica
router.post('/CreateProperties',upload.array('images', 10),createProperty);
router.get('/admin/propiedades', verifyToken, getPropertiesForAdmin);


export default router;