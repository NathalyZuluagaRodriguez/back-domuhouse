import { Request, Response } from 'express';
import Promisepool from '../config/config-db';

// Create Property
export const createProperty = async (req: Request, res: Response) => {
  try {
    console.log('Received data to create property:', req.body);

    const {
      address, property_title, description, image, price, status, person_id, property_type_id,
      socioeconomic_stratum, city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
      built_area, total_area, latitude, longitude
    } = req.body;

    const [result] = await Promisepool.query(
      'CALL sp_create_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        address, property_title, description, image, price, status, person_id, property_type_id,
        socioeconomic_stratum, city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
        built_area, total_area, latitude, longitude
      ]
    );

    res.status(201).json({ message: 'Property created successfully', result });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ error: 'Error creating property' });
  }
};

// Edit Property
export const editProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      property_title, address, description, price, status, socioeconomic_stratum,
      city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
      built_area, total_area, latitude, longitude
    } = req.body;

    const [result] = await Promisepool.query(
      'CALL sp_edit_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, property_title, address, description, price, status, socioeconomic_stratum,
        city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
        built_area, total_area, latitude, longitude
      ]
    );

    res.json({ message: 'Property updated successfully', result });
  } catch (error) {
    console.error('Error in editProperty:', error);
    res.status(500).json({ error: 'Error updating property' });
  }
};

// Delete Property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Promisepool.query('CALL sp_delete_property(?)', [id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ error: 'Error deleting property' });
  }
};

// Approve Property
export const approveProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Promisepool.query('CALL sp_approve_property(?)', [id]);
    res.json({ message: 'Property approved successfully' });
  } catch (error) {
    console.error('Error in approveProperty:', error);
    res.status(500).json({ error: 'Error approving property' });
  }
};

// Get All Properties
export const getProperties = async (req: Request, res: Response) => {
  try {
    const [result] = await Promisepool.query('CALL sp_list_approved_properties()');
    // Las llamadas a procedimientos almacenados en MySQL devuelven un array anidado
    const properties = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
    res.json(properties);
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({ error: 'Error retrieving properties' });
  }
};

// Get Approved Properties
export const getApprovedProperties = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await Promisepool.query('CALL sp_list_approved_properties()');
    const properties = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
    res.json(properties);
  } catch (error) {
    console.error('Error in getApprovedProperties:', error);
    res.status(500).json({ error: 'Error retrieving approved properties' });
  }
};

// Get Properties by Type
export const getPropertiesByType = async (req: Request, res: Response) => {
  try {
    const { property_type_id } = req.params;

    // Validación mejorada
    if (!property_type_id || isNaN(Number(property_type_id))) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de tipo de propiedad no válido',
        hint: 'El ID debe ser un número. Ejemplo: /api/propiedades/tipo/1'
      });
    }

    // Llamar al procedimiento almacenado
    const [results]: any = await Promisepool.query(
      'CALL sp_get_properties_by_type(?)',
      [property_type_id]
    );

    // Manejar diferentes formatos de respuesta de MySQL
    const properties = Array.isArray(results[0]) ? results[0] : results;

    if (!properties || properties.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No se encontraron propiedades para este tipo',
        hint: 'Verifica que el tipo de propiedad exista o que haya propiedades aprobadas de este tipo'
      });
    }

    // Obtener el nombre del tipo de propiedad para la respuesta
    const [typeInfo]: any = await Promisepool.query(
      'SELECT type_name FROM PropertyType WHERE property_type_id = ?',
      [property_type_id]
    );

    res.json({
      success: true,
      property_type: typeInfo[0]?.type_name || 'Desconocido',
      count: properties.length,
      data: properties
    });

  } catch (error: any) {
    console.error('Error en getPropertiesByType:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener propiedades por tipo',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};