import { Router } from 'express';
import { registerAdmin, eliminarAdmin } from '../controllers/adminController';
import { createProperty, getProperties} from '../controllers/propertyController';
import upload from '../middleware/upload';
import { verifyToken } from '../middleware/VerifyToken';
import { getGlobalSalesReport, getSoldPropertiesCount, getSalesByPropertyType, getTopAgents } from '../controllers/getAlquileresVentaController';


const router = Router();

router.post('/registerAdmin', registerAdmin);
router.delete('/eliminarAdmin', eliminarAdmin); // mejor semántica
router.post('/CreateProperties',upload.array('images', 10),createProperty);
router.get('/admin/propiedades', verifyToken, getProperties);


// Ruta que obtiene ventas
router.get("/global-sales", getGlobalSalesReport);

// Ruta que obtiene las propiedades vendidas
router.get("/sold-properties/count", getSoldPropertiesCount);


router.get("/property-type-sales", getSalesByPropertyType);


router.get("/top-agents", getTopAgents);

export default router;