import { Router } from 'express';
import registerRealEstate, { getAllRealEstates, updateRealEstate ,getRealEstateStatistics } from '../controllers/realEstateController';
import upload from "../config/cloudinary";

const router = Router();

// Ruta GET para obtener todas las inmobiliarias
router.get('/getAllRealEstates', getAllRealEstates);

router.get('/stats', getRealEstateStatistics);

// Ruta POST para registrar una nueva inmobiliaria (ya existente)
router.post('/registerRealEstate', registerRealEstate);


router.put("/realestate/:id", updateRealEstate);

export default router;