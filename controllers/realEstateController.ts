import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";
import pool from "../config/config-db"

/**
 * Handler para registrar una nueva inmobiliaria.
 */
const registerRealEstate = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const fields = [
      "name_realestate",
      "nit",
      "phone",
      "email",
      "department",
      "num_properties",
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

    await realEstateServices.registerRealEstate(data);
    return res.status(201).json({ message: "Real estate registered successfully." });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}; // ← Cierre completo de registerRealEstate

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
    name,
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
      name,
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


export default registerRealEstate;