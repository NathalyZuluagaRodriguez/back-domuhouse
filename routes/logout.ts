import { Router } from 'express';
import  { logout }  from '../controllers/logoutController';


const router = Router();

router.post('/logout', logout);

export default router;