import { Router } from 'express';
import { confirmRegister } from '../controllers/confirmacionController';

const router = Router();

router.get('/confirmar/:correo', confirmRegister);

export default router;
