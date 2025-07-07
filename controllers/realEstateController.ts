// ===== CONTROLADOR (realEstateController.ts) =====
import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";
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

export default registerRealEstate;