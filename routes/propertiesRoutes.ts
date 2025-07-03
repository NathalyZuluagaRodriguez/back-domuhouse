// routes/propertiesRoutes.ts
import express from 'express';
import upload from '../middleware/upload'; // Tu middleware de multer
import {
  createProperty,
  editProperty,
  deleteProperty,
  approveProperty,
  getProperties,
  getApprovedProperties,
  getPropertiesByType,
  getPropertyById,
  getPropertyImages,
  getPropertiesWithMainImages,
  getPropertyMainImage
} from '../controllers/propertyController';
import { getUserProperties } from '../controllers/userPropertyController';
import { verifyToken } from '../middleware/VerifyToken';

const router = express.Router();

// 🏠 RUTAS PÚBLICAS (sin autenticación)
// f
// ✅ Crear propiedad - CON UPLOAD DE IMÁGENES
router.post('/create', upload.array('images', 10), createProperty);

// ✅ Editar propiedad
router.put('/editar/:id', editProperty);

// ✅ Eliminar propiedad
router.delete('/eliminar/:id', deleteProperty);

// En tu archivo de rutas
router.get('/details/:id/images', getPropertyImages);  

// ✅ Aprobar propiedad
router.patch('/:id/approve', approveProperty);

// ✅ Obtener todas las propiedades
router.get('/get', getProperties);

// ✅ Obtener propiedades aprobadas
router.get('/approved', getApprovedProperties);

// ✅ Obtener propiedades por tipo
router.get('/type/:property_type_id', getPropertiesByType);

// ✅ Obtener propiedad por ID (debe ir al final para evitar conflictos)
router.get('/details/:id', getPropertyById);                  // GET /api/properties/details/:id

router.get('/mis-propiedades', verifyToken, getUserProperties);

router.get("/properties/approved", getApprovedProperties)

// ✅ Nuevas rutas para imágenes
router.get("/properties/with-images", getPropertiesWithMainImages)
router.get("/properties/:id/main-image", getPropertyMainImage)

export default router;