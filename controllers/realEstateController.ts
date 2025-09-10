import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";
import pool from "../config/config-db";
import { RowDataPacket } from "mysql2";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();
export const uploadLogo = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // ✅ Corrección: usar null en lugar de new Error()
      cb(null, false);
    }
  }
});

// Interfaz actualizada para incluir logo_url
interface RealEstate extends RowDataPacket {
  id: number;
  name_realestate: string;
  nit: string;
  responsible: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  logo_url?: string;
  images?: string[];
}

// Función helper para subir a Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string = 'real-estate-logos'): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 300, height: 300, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

/**
 * Handler para registrar una nueva inmobiliaria con logo.
 */
const registerRealEstate = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const logoFile = req.file; // Archivo de logo subido
    
    const fields = [
      "name_realestate",
      "nit",
      "phone",
      "email",
      "department",
      "num_properties",
      "city",
      "address",
      "description",
      "person_id"
    ];

    // Validar campos requeridos
    for (const field of fields) {
      if (!data[field as keyof typeof data]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }

    // ✅ Validar tipo de archivo si se subió uno
    if (req.file && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ 
        message: 'Solo se permiten archivos de imagen para el logo' 
      });
    }

    let logoUrl: string | null = null;

    // Subir logo a Cloudinary si se proporcionó
    if (logoFile) {
      try {
        console.log('📸 Subiendo logo a Cloudinary...');
        const uploadResult = await uploadToCloudinary(logoFile.buffer);
        logoUrl = uploadResult.secure_url;
        console.log('✅ Logo subido exitosamente:', logoUrl);
      } catch (uploadError) {
        console.error('❌ Error subiendo logo a Cloudinary:', uploadError);
        return res.status(400).json({ 
          message: 'Error al subir el logo. Por favor intenta de nuevo.' 
        });
      }
    }

    // Agregar logo URL a los datos
    const realEstateData = {
      ...data,
      logo_url: logoUrl
    };
    console.log('🔍 Datos enviados al servicio:', realEstateData); // ✅ Debug

    await realEstateServices.registerRealEstate(realEstateData);
    
    return res.status(201).json({ 
      message: "Real estate registered successfully.",
      logo_url: logoUrl 
    });
    
  } catch (error: any) {
    console.error('❌ Error registrando inmobiliaria:', error);
    return res.status(400).json({ message: error.message });
  }
};
// ← Cierre completo de registerRealEstate

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
      address: realEstate.address, // ✅ Mapear correctamente address
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
        address = ?, -- ✅ Usar (como está en la BD)
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

export const getPropertiesByAdmin = async (req: Request, res: Response) => {
  const { adminId } = req.params;

  try {
    const [result]: any = await pool.query('CALL GetPropertiesByAdmin(?)', [adminId]);

    const properties = result[0]; // 👈 Accedemos al primer array de resultados

    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: "No se encontraron propiedades para esta inmobiliaria" });
    }

    return res.status(200).json(properties);
  } catch (error) {
    console.error("❌ Error al ejecutar GetPropertiesByAdmin:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



export default registerRealEstate;
