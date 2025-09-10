import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";

/**
 * Handler para registrar una nueva inmobiliaria.
 */
const registerRealEstate = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const fields = [
      "name",
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


export default registerRealEstate;
