// routes/invitacionRoutes.ts
import { Router } from 'express';
import { generateInvitation, getInvitationTokens } from '../controllers/invitationController';

const router = Router();

router.post('/generar-token', generateInvitation);
router.get('/tokens', getInvitationTokens) 

export default router;
