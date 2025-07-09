// ===== CONTROLADOR (realEstateController.ts) =====
import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";
import pool from "../config/config-db"
import { RowDataPacket } from "mysql2";

interface RealEstate extends RowDataPacket {
  id: number;
  name_realestate: string;
  nit: string;
  responsible: string;
  adress: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  images?: string[];
}
import cloudinary from "../config/cloudinary";
import fs from 'fs';

/**
 * Handler para registrar una nueva inmobiliaria.
 */
const registerRealEstate = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    let logoUrl = null;

    // ✅ CAMPO num_properties REMOVIDO DE LA VALIDACIÓN
    const fields = [
      "name_realestate",
      "nit",
      "phone",
      "email",
      "department",
      "city",
      "adress",
      "description",
      "person_id"
    ];
    
    for (const field of fields) {
      if (!data[field as keyof typeof data]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'inmobiliarias/logos',
          public_id: `logo_${data.name_realestate.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
          transformation: [
            { width: 300, height: 300, crop: 'fit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        });

        logoUrl = result.secure_url;
        
        // Eliminar el archivo temporal
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Error uploading logo to Cloudinary:', uploadError);
        // Eliminar el archivo temporal en caso de error
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Error uploading logo' });
      }
    }

    // Agregar la URL del logo a los datos
    const realEstateData = {
      ...data,
      logo_url: logoUrl
    };

    await realEstateServices.registerRealEstate(realEstateData);
    return res.status(201).json({ message: "Real estate registered successfully.", logo_url: logoUrl });
  } catch (error: any) {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Handler para obtener todas las inmobiliarias registradas.
 */
export const getAllRealEstates = async (req: Request, res: Response) => {
  try {
    const inmobiliarias = await realEstateServices.fetchAllRealEstates();
    return res.status(200).json(inmobiliarias);
  } catch (error: any) {
    console.error("Error al obtener inmobiliarias:", error);
    return res.status(500).json({ message: "Error interno al obtener inmobiliarias." });
  }
};

export const getRealEstateStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await realEstateServices.getRealEstateStatistics();
        return res.status(200).json(stats);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateRealEstate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name_realestate,
    nit,
    phone,
    email,
    department,
    city,
    address,
    description
  } = req.body;

  try {
    await pool.query("CALL sp_update_real_estate(?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id,
      name_realestate,
      nit,
      phone,
      email,
      department,
      city,
      address,
      description
    ]);

    res.status(200).json({ message: "Inmobiliaria actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar inmobiliaria:", error);
    res.status(500).json({ error: "Error al actualizar la inmobiliaria" });
  }
};

export const getRealEstateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT re.*, p.name_person AS encargado_nombre 
       FROM realestate re 
       JOIN person p ON re.person_id = p.person_id 
       WHERE re.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Inmobiliaria no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener inmobiliaria por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const deleteRealEstate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. Obtener person_id del admin de esa inmobiliaria
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT person_id FROM realestate WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Inmobiliaria no encontrada" });
    }

    const personId = rows[0].person_id;

    // 2. Eliminar propiedades relacionadas con el admin
    await pool.query('DELETE FROM property WHERE person_id = ?', [personId]);

    // 3. Eliminar la inmobiliaria
    await pool.query('DELETE FROM realestate WHERE id = ?', [id]);

    // 4. Eliminar al admin (si es role_id 1)
    await pool.query('DELETE FROM person WHERE person_id = ? AND role_id = 1', [personId]);

    return res.status(200).json({ message: "Inmobiliaria, propiedades y administrador eliminados correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar inmobiliaria:", error);
    return res.status(500).json({ message: "Error al eliminar inmobiliaria" });
  }
};



export default registerRealEstate;