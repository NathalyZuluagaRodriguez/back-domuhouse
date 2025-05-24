// routes/invitacionRoutes.ts
import { Router } from 'express';
import { generarInvitacion } from '../controllers/invitacionController';

const router = Router();

router.post('/generar-token', generarInvitacion);

export default router;
