import { Request, Response } from 'express';
import Promisepool from '../config/config-db';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const createProperty = async (req: Request, res: Response) => {
  try {
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

    const imagesJson = JSON.stringify(imageUrls); // Convertir a texto para guardar

    const [result] = await Promisepool.query(
      'CALL sp_create_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        adress, property_title, description, imagesJson, price, status, person_id,
        property_type_id, socioeconomic_stratum, city, neighborhood, operation_type,
        bedrooms, bathrooms, parking_spaces, built_area, total_area, latitude, longitude
      ]
    );

    res.status(201).json({
      message: 'Property created successfully',
      property: result,
    });
  } catch (error: any) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ error: 'Error creating property', detail: error.message });
  }
};

// Edit Property
export const editProperty = async (req: Request, res: Response) => {
  try {
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


export const getPropertiesByType = async (req: Request, res: Response) => {
  try {
    const { property_type_id } = req.params;

    // Verifica que id_tipo_propiedad sea un número válido
    if (isNaN(Number(property_type_id))) {
      return res.status(400).json({ error: 'El ID de tipo de propiedad debe ser un número válido' });
    }

    // Consulta para obtener propiedades filtradas por tipo
    const [result] = await Promisepool.query(
      'SELECT * FROM Property WHERE property_type_id = ?',
      [property_type_id]
    );

    if (Array.isArray(result) && result.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron propiedades para este tipo' });
    }

    res.json({ property: result });
  } catch (error: any) {
    console.error('Error al obtener propiedades por tipo:', error);
    res.status(500).json({ error: error.sqlMessage || 'Error interno' });
  }
};