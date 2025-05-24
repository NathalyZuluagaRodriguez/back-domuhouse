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
