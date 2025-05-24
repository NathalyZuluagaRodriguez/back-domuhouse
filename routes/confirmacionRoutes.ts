import { Router } from 'express';
import { confirmarRegistro } from '../controllers/confirmacionController';

const router = Router();

router.get('/confirmar/:correo', confirmarRegistro);

export default router;
