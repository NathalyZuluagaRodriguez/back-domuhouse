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

export const getRealEstateById = async (req: Request, res: Response) => {
  const { id } = req.params

  console.log("🔍 [getRealEstateById] ID recibido:", id)

  try {
    // Validar ID
    if (!id || isNaN(Number(id))) {
      console.log("❌ ID inválido")
      return res.status(400).json({
        success: false,
        message: "ID de inmobiliaria inválido",
      })
    }

    // Consulta SQL simplificada - SIN JOIN primero para probar
    console.log("📊 Ejecutando consulta básica...")
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM realestate WHERE id = ?", [id])

    console.log("📊 Resultados encontrados:", rows.length)
    console.log("📊 Datos:", rows)

    if (rows.length === 0) {
      console.log("❌ Inmobiliaria no encontrada")
      return res.status(404).json({
        success: false,
        message: "Inmobiliaria no encontrada",
      })
    }

    const realEstate = rows[0]

    // Intentar obtener el nombre del encargado por separado
    let encargadoNombre = "Sin encargado"
    if (realEstate.person_id) {
      try {
        console.log("👤 Buscando persona con ID:", realEstate.person_id)
        const [personRows] = await pool.query<RowDataPacket[]>(
          "SELECT name_person, last_name FROM Person WHERE person_id = ?",
          [realEstate.person_id],
        )

        if (personRows.length > 0) {
          encargadoNombre = `${personRows[0].name_person} ${personRows[0].last_name}`
          console.log("👤 Encargado encontrado:", encargadoNombre)
        }
      } catch (personError) {
        console.warn("⚠️ Error al obtener persona:", personError)
        // Continuar sin el nombre del encargado
      }
    }

    // Preparar respuesta
    const response = {
      id: realEstate.id,
      name_realestate: realEstate.name_realestate,
      nit: realEstate.nit,
      phone: realEstate.phone,
      email: realEstate.email,
      department: realEstate.department,
      city: realEstate.city,
      address: realEstate.address, // ✅ Mapear correctamente adress -> address
      description: realEstate.description,
      person_id: realEstate.person_id,
      encargado_nombre: encargadoNombre,
      images: [], // Array vacío por ahora
    }

    console.log("✅ Respuesta preparada:", response)

    res.status(200).json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("❌ Error completo:", error)

    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: error instanceof Error ? error.stack : undefined,
              id: id,
            }
          : undefined,
    })
  }
}

// Actualizar inmobiliaria
export const updateRealEstate = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name_realestate, nit, phone, email, department, city, address, description, person_id } = req.body

  console.log("🔄 Actualizando inmobiliaria ID:", id)
  console.log("📝 Datos recibidos:", req.body)

  try {
    if (!person_id) {
      return res.status(400).json({
        success: false,
        error: "El campo person_id es obligatorio",
      })
    }

    // Actualizar con SQL directo
    const [result] = await pool.query(
      `UPDATE realestate SET 
        name_realestate = ?, 
        nit = ?, 
        phone = ?, 
        email = ?, 
        department = ?, 
        city = ?, 
        address = ?, -- ✅ Usar 'adress' (como está en la BD)
        description = ?
      WHERE id = ? AND person_id = ?`,
      [name_realestate, nit, phone, email, department, city, address, description, id, person_id],
    )

    console.log("✅ Actualización completada:", result)

    res.status(200).json({
      success: true,
      message: "Inmobiliaria actualizada correctamente",
    })
  } catch (error) {
    console.error("❌ Error al actualizar:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}




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