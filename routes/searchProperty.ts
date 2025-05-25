import { Router } from 'express';
import { PropertyRepository } from '../repositories/propertyRepository';

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const {
      socioeconomic_stratum,
      neighborhood,
      city,
      price_min,
      price_max,
      property_type,
      operation_type,
      bedrooms_min,
      bedrooms_max,
      bathrooms_min,
      bathrooms_max,
      parking_spaces,
      built_area_min,
      built_area_max,
      total_area_min,
      total_area_max,
      features,
      order,
    } = req.query;

    const filters = {
      socioeconomic_stratum: socioeconomic_stratum ? Number(socioeconomic_stratum) : undefined,
      neighborhood: neighborhood?.toString(),
      city: city?.toString(),
      price_min: price_min ? Number(price_min) : undefined,
      price_max: price_max ? Number(price_max) : undefined,
      property_type_id: property_type ? Number(property_type) : undefined,
      operation_type: operation_type?.toString(),
      bedrooms_min: bedrooms_min ? Number(bedrooms_min) : undefined,
      bedrooms_max: bedrooms_max ? Number(bedrooms_max) : undefined,
      bathrooms_min: bathrooms_min ? Number(bathrooms_min) : undefined,
      bathrooms_max: bathrooms_max ? Number(bathrooms_max) : undefined,
      parking_spaces_min: parking_spaces ? Number(parking_spaces) : undefined,
      built_area_min: built_area_min ? Number(built_area_min) : undefined,
      built_area_max: built_area_max ? Number(built_area_max) : undefined,
      total_area_min: total_area_min ? Number(total_area_min) : undefined,
      total_area_max: total_area_max ? Number(total_area_max) : undefined,
      features: features ? features.toString().split(',') : undefined,
      order: order?.toString(),
    };

    const properties = await PropertyRepository.searchAdvanced(filters);
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ message: 'Error in advanced search' });
  }
});

export default router;
