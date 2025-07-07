import { Router } from 'express';
import registerRealEstate, { getAllRealEstates, updateRealEstate ,getRealEstateStatistics, getRealEstateById, deleteRealEstate } from '../controllers/realEstateController';

const router = Router();

// Ruta GET para obtener todas las inmobiliarias
router.get('/getAllRealEstates', getAllRealEstates);

router.get('/stats', getRealEstateStatistics);

// Ruta POST para registrar una nueva inmobiliaria (ya existente)
router.post('/registerRealEstate', registerRealEstate);


router.put("/realestate/:id", updateRealEstate);

router.get('/:id', getRealEstateById); // ✅ nueva ruta


router.delete("/delete/realestate/:id", deleteRealEstate);


export default router;