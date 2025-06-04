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
  getPropertyById
} from '../controllers/propertyController';

const router = express.Router();

// 🏠 RUTAS PÚBLICAS (sin autenticación)

// ✅ Crear propiedad - CON UPLOAD DE IMÁGENES
router.post('/', upload.array('images', 10), createProperty);

// ✅ Editar propiedad
router.put('/:id', editProperty);

// ✅ Eliminar propiedad
router.delete('/:id', deleteProperty);

// ✅ Aprobar propiedad
router.patch('/:id/approve', approveProperty);

// ✅ Obtener todas las propiedades
router.get('/', getProperties);

// ✅ Obtener propiedades aprobadas
router.get('/approved', getApprovedProperties);

// ✅ Obtener propiedades por tipo
router.get('/type/:property_type_id', getPropertiesByType);

// ✅ Obtener propiedad por ID (debe ir al final para evitar conflictos)
router.get('/:id', getPropertyById);

export default router;