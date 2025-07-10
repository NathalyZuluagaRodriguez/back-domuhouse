import { Router } from 'express';
import registerRealEstate, { getAllRealEstates, updateRealEstate, getPropertiesByAdmin, getRealEstateStatistics, getRealEstateById, deleteRealEstate } from '../controllers/realEstateController';
import upload from "../config/cloudinary";

const router = Router();

// Ruta GET para obtener todas las inmobiliarias
router.get('/getAllRealEstates', getAllRealEstates);

router.get('/stats', getRealEstateStatistics);

// Ruta POST para registrar una nueva inmobiliaria (ya existente)
router.post('/registerRealEstate', registerRealEstate);

// Ruta para obtener las propiedades
router.get('/admin/:adminId/properties', getPropertiesByAdmin);


router.put("/realestate/:id", updateRealEstate);

router.get('/:id', getRealEstateById); // ✅ nueva ruta


router.delete("/delete/realestate/:id", deleteRealEstate);


export default router;