// routes/invitacionRoutes.ts
import { Router } from 'express';
import { generateInvitation } from '../controllers/invitationController';

const router = Router();

router.post('/generar-token', generateInvitation);

export default router;
