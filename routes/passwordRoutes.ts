import { Router } from 'express';
import { SendRecoveryMail  } from '../controllers/passwordController';
import { changePassword } from '../controllers/passwordController';

const router = Router();

router.post('/recuperar-password', SendRecoveryMail);
router.post('/cambiar-password', changePassword);

export default router;
