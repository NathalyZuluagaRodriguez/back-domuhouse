import { Request, Response } from 'express';
import Promisepool from '../config/config-db';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const createProperty = async (req: Request, res: Response) => {
  try {
    console.log('🏠 createProperty - Iniciando...');
    const {
      adress, property_title, description, price, status, person_id, property_type_id,
      socioeconomic_stratum, city, neighborhood, operation_type, bedrooms, bathrooms,
      parking_spaces, built_area, total_area, latitude, longitude
    } = req.body;

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    if (files.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images allowed' });
    }

    // Subir imágenes a Cloudinary en paralelo
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: 'properties',
      }).then(result => {
        fs.unlinkSync(file.path); // elimina archivo temporal
        return result.secure_url;
      })
    );

    const imageUrls = await Promise.all(uploadPromises);
    const imagesJson = JSON.stringify(imageUrls);

    const [result] = await Promisepool.query(
      'CALL sp_create_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        adress, property_title, description, imagesJson, price, status, person_id,
        property_type_id, socioeconomic_stratum, city, neighborhood, operation_type,
        bedrooms, bathrooms, parking_spaces, built_area, total_area, latitude, longitude
      ]
    );

    console.log('✅ Property created successfully');
    res.status(201).json({
      message: 'Property created successfully',
      property: result,
    });
  } catch (error: any) {
    console.error('❌ Error in createProperty:', error);
    res.status(500).json({ error: 'Error creating property', detail: error.message });
  }
};

export const editProperty = async (req: Request, res: Response) => {
  try {
    console.log('✏️ editProperty - ID:', req.params.id);
    const { id } = req.params;
    const {
      property_title, adress, description, price, status, socioeconomic_stratum,
      city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
      built_area, total_area, latitude, longitude
    } = req.body;

    const [result] = await Promisepool.query(
      'CALL sp_edit_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, property_title, adress, description, price, status, socioeconomic_stratum,
        city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
        built_area, total_area, latitude, longitude
      ]
    );

    console.log('✅ Property updated successfully');
    res.json({ message: 'Property updated successfully', result });
  } catch (error: any) {
    console.error('❌ Error in editProperty:', error);
    res.status(500).json({ error: 'Error updating property', detail: error.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    console.log('🗑️ deleteProperty - ID:', req.params.id);
    const { id } = req.params;
    
    await Promisepool.query('CALL sp_delete_property(?)', [id]);
    
    console.log('✅ Property deleted successfully');
    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error in deleteProperty:', error);
    res.status(500).json({ error: 'Error deleting property', detail: error.message });
  }
};

// 

export const approveProperty = async (req: Request, res: Response) => {
  try {
    console.log('✅ approveProperty - Iniciando...');
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    await Promisepool.query('CALL sp_approve_property(?)', [id]);

    console.log(`🏠 Propiedad con ID ${id} aprobada correctamente`);
    res.status(200).json({ message: 'Property approved successfully' });
  } catch (error: any) {
    console.error('❌ Error en approveProperty:', error);
    res.status(500).json({ error: 'Error approving property', detail: error.message });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    console.log('📋 getProperties - Obteniendo todas las propiedades...');
    const [result] = await Promisepool.query('CALL sp_list_approved_properties()');
    const properties = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
    
    console.log(`✅ Se encontraron ${properties.length} propiedades`);
    res.json(properties);
  } catch (error: any) {
    console.error('❌ Error in getProperties:', error);
    res.status(500).json({ error: 'Error retrieving properties', detail: error.message });
  }
};

export const getApprovedProperties = async (req: Request, res: Response) => {
  try {
    console.log('✅ getApprovedProperties - Obteniendo propiedades aprobadas...');
    const [rows]: any = await Promisepool.query('CALL sp_list_approved_properties()');
    const properties = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
    
    console.log(`✅ Se encontraron ${properties.length} propiedades aprobadas`);
    res.json(properties);
  } catch (error: any) {
    console.error('❌ Error in getApprovedProperties:', error);
    res.status(500).json({ error: 'Error retrieving approved properties', detail: error.message });
  }
};

export const getPropertiesByType = async (req: Request, res: Response) => {
  try {
    console.log('🏠 getPropertiesByType - Tipo:', req.params.property_type_id);
    const { property_type_id } = req.params;

    if (isNaN(Number(property_type_id))) {
      return res.status(400).json({ error: 'El ID de tipo de propiedad debe ser un número válido' });
    }

    const [result] = await Promisepool.query(
      'SELECT * FROM Property WHERE property_type_id = ? AND approved = TRUE',
      [property_type_id]
    );

    if (Array.isArray(result) && result.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron propiedades para este tipo' });
    }

    console.log(`✅ Se encontraron ${Array.isArray(result) ? result.length : 0} propiedades del tipo ${property_type_id}`);
    res.json({ property: result });
  } catch (error: any) {
    console.error('❌ Error al obtener propiedades por tipo:', error);
    res.status(500).json({ error: error.sqlMessage || 'Error interno', detail: error.message });
  }
};