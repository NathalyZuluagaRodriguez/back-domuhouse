import express from 'express';
import * as iaController from '../controllers/iaController';

const router = express.Router();

// RF03.1 - Ruta para procesar información de un inmueble para estimación
router.post('/ingresar-inmueble', iaController.procesarInmueble);

// RF03.2 - Obtener filtros disponibles para análisis de inmuebles
router.get('/filtros', iaController.obtenerFiltros);

// RF03.3 - Obtener datos del mercado inmobiliario
router.get('/mercado', iaController.obtenerDatosMercado);

// Nueva ruta para análisis de tendencias avanzado
router.post('/analisis-tendencias', iaController.analizarTendenciasAvanzado);

export default router;