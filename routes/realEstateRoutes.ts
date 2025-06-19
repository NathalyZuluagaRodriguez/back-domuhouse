import { Router } from 'express';
import registerRealEstate, { getAllRealEstates, getRealEstateStatistics } from '../controllers/realEstateController';

const router = Router();

// Ruta GET para obtener todas las inmobiliarias
router.get('/getAllRealEstates', getAllRealEstates);

router.get('/stats', getRealEstateStatistics);

// Ruta POST para registrar una nueva inmobiliaria (ya existente)
router.post('/registerRealEstate', registerRealEstate);

export default router;
