import { Request, Response } from 'express';
import Promisepool from '../config/config-db';

export const getUserProperties = async (req: Request & { user?: { id: number } }, res: Response) => {
  try {
    const userId = req.user?.id;

    console.log(`📋 getUserProperties - Propiedades del usuario ${userId}`);

    const [result] = await Promisepool.query('CALL sp_list_properties_by_person_id(?)', [userId]);
    const properties = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];

    res.status(200).json({
      success: true,
      count: properties.length, 
      properties
    });
  } catch (error: any) {
    console.error('❌ Error en getUserProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propiedades del usuario',
      detail: error.message
    });
  }
};
