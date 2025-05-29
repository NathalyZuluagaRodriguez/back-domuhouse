import { Router } from 'express';
import {
  registerIndependentUser,
  sendConfirmationEmail,
  confirmIndependentRegistration
} from '../controllers/independentController';

const router = Router();

router.post('/register', registerIndependentUser);
router.post('/verify-email', sendConfirmationEmail);
router.post('/confirm-registration', confirmIndependentRegistration);

export default router;
