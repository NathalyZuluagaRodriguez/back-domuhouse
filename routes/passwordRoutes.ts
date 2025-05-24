import { Router } from 'express';
import { enviarCorreoRecuperacion  } from '../controllers/passwordController';
import { cambiarPassword } from '../controllers/passwordController';

const router = Router();

router.post('/recuperar-password', enviarCorreoRecuperacion);
router.post('/cambiar-password', cambiarPassword);

export default router;
