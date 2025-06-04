import { Router } from 'express';
import { registerAdmin, eliminarAdmin } from '../controllers/adminController';


const router = Router();

router.post('/registro', registerAdmin);
router.delete('/admin/eliminar', eliminarAdmin); // mejor semántica


export default router;
