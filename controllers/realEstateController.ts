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
    name_realestate,
    nit,
    phone,
    email,
    department,
    city,
    address,
    description,
    person_id
  } = req.body;

  try {
    // Validación básica
    if (!person_id) {
      return res.status(400).json({ error: "El campo person_id es obligatorio" });
    }

    // Llamar al procedimiento
    await pool.query(
      `CALL sp_update_real_estate(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name_realestate,
        nit,
        phone,
        email,
        department,
        city,
        address,
        description,
        person_id
      ]
    );

    res.status(200).json({ message: "Inmobiliaria actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar inmobiliaria:", error);
    res.status(500).json({ error: "Error al actualizar la inmobiliaria" });
  }
};

// Obtener inmobiliaria por ID con nombre del encargado
export const getRealEstateById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        r.name_realestate,
        r.nit,
        r.phone,
        r.email,
        r.department,
        r.city,
        r.address,
        r.description,
        r.person_id,
        CONCAT(p.name_person, ' ', p.last_name) AS encargado_nombre
      FROM realestate r
      LEFT JOIN person p ON r.person_id = p.id
      WHERE r.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Inmobiliaria no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener inmobiliaria:", error);
    res.status(500).json({ message: "Error al obtener la inmobiliaria" });
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