import { Router } from 'express';
import { PropertyRepository } from '../repositories/propertyRepository';

const router = Router();

// GET /busqueda-avanzada
router.get('/busqueda', async (req, res) => {
  try {
    const {
      estrato,
      barrio,
      ciudad,
      precio_min,
      precio_max,
      tipo_propiedad,
      tipo_operacion,
      habitaciones_min,
      habitaciones_max,
      banos_min,
      banos_max,
      parqueaderos,
      area_construida_min,
      area_construida_max,
      area_total_min,
      area_total_max,
      caracteristicas, // lista de características separadas por coma
      orden,
    } = req.query;

    const filtros = {
      estrato: estrato ? Number(estrato) : undefined,
      barrio: barrio?.toString(),
      ciudad: ciudad?.toString(),
      precio_min: precio_min ? Number(precio_min) : undefined,
      precio_max: precio_max ? Number(precio_max) : undefined,
      tipo_propiedad: tipo_propiedad?.toString(),
      tipo_operacion: tipo_operacion?.toString(),
      habitaciones_min: habitaciones_min ? Number(habitaciones_min) : undefined,
      habitaciones_max: habitaciones_max ? Number(habitaciones_max) : undefined,
      banos_min: banos_min ? Number(banos_min) : undefined,
      banos_max: banos_max ? Number(banos_max) : undefined,
      parqueaderos: parqueaderos ? Number(parqueaderos) : undefined,
      area_construida_min: area_construida_min ? Number(area_construida_min) : undefined,
      area_construida_max: area_construida_max ? Number(area_construida_max) : undefined,
      area_total_min: area_total_min ? Number(area_total_min) : undefined,
      area_total_max: area_total_max ? Number(area_total_max) : undefined,
      caracteristicas: caracteristicas ? caracteristicas.toString().split(',') : undefined,
      orden: orden?.toString()
    };

    const propiedades = await PropertyRepository.buscarPropiedadesAvanzado(filtros);
    res.status(200).json(propiedades);
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({ message: 'Error en la búsqueda avanzada' });
  }
});

export default router;
