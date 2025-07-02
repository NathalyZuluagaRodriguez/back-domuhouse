import realEstateRepo from "../repositories/realEstatesRepositorys";
import sendEmail from "../utils/sendEmailer"; 
import pool from '../config/config-db';
import { Request, Response } from 'express';


//interface de inmobiliaria
interface NewRealEstate {
    name_realestate: string,
    nit: string,
    phone: string,
    email: string,
    num_properties: number,
    department: string,
    city: string;
    adress: string,
    description: string,
    person_id: number
}

const registerRealEstate = async (data: NewRealEstate) => {
    try {
        const personExists = await realEstateRepo.personExists(data.person_id);
        if (!personExists) {
            throw new Error("The person_id is not registered in the database");
        }

        // RF05.5: Validate if already an admin
        const isAlreadyAdmin = await realEstateRepo.checkIfAlreadyAdmin(data.person_id);
        if (isAlreadyAdmin) {
            throw new Error("You are already registered as an admin of a real estate");
        }

        // RF05.2: Validate duplicate name/email
        const exists = await realEstateRepo.findByNameOrEmail(data.name_realestate, data.email);
        if (exists) {
            throw new Error("A real estate with this name or email already exists");
        }

        // RF05.4: Insert real estate with person_id as main admin
        const created = await realEstateRepo.createRealEstate(data);
        if (!created) {
            throw new Error("Error registering the real estate");
        }

        const adminEmail = await realEstateRepo.getPersonEmail(data.person_id);
        if (adminEmail) {
            await sendEmail(
                adminEmail,
                "Successful Real Estate Registration",
                `Hello! Your real estate "${data.name_realestate}" has been successfully registered. 
                 You are now the main admin. You can log in to manage your properties, agents, and more.`
            );
        }

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const fetchAllRealEstates = async (req: Request, res: Response) => {
  try {
    const results = await realEstateRepo.getAllRealEstates();
    res.json(results);
  } catch (error) {
    console.error('Error getting all real estates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRealEstateStatistics = async () => {
const query = `
  SELECT 
    (SELECT COUNT(*) FROM property) AS total_properties,
    (SELECT COUNT(*) FROM realestate) AS total_real_estates,
    (SELECT COALESCE(AVG(re.num_properties), 0) FROM realestate re) AS avg_properties_per_real_estate
`;


  try {
    const [rows] = await pool.execute(query);
    return (rows as any[])[0];
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};


/**
 * Obtener una inmobiliaria específica por ID
 */
const getRealEstateById = async (id: number) => {
  const query = `
  SELECT 
    re.id,
    re.name_realestate,
    re.nit,
    re.phone,
    re.email,
    re.department,
    re.city,
    re.adress,
    re.description,
    re.num_properties,
    p.name_person as responsable_name,
    p.last_name as responsable_lastname
  FROM realestate re
  LEFT JOIN person p ON re.person_id = p.person_id
  WHERE re.id = ?
`;

  
  try {
    const [rows] = await pool.execute(query, [id]);
    return (rows as any[]).length > 0 ? (rows as any[])[0] : null;
  } catch (error) {
    console.error('Error fetching real estate by ID:', error);
    throw error;
  }
};

/**
 * Obtener todos los agentes de una inmobiliaria
 */
const getRealEstateAgents = async (realEstateId: number) => {
  const query = `
    SELECT 
      p.person_id,
      p.name_person AS name,
      p.last_name,
      p.email,
      p.phone,
      p.role_id,
      COUNT(pr.property_id) AS num_properties
    FROM person p
    LEFT JOIN property pr ON p.person_id = pr.person_id
    WHERE p.role_id = 2 AND p.real_estate_id = ?
    GROUP BY p.person_id, p.name_person, p.last_name, p.email, p.phone, p.role_id
    ORDER BY p.name_person
  `;

  try {
    const [rows] = await pool.execute(query, [realEstateId]);
    return rows as any[];
  } catch (error) {
    console.error('Error fetching real estate agents:', error);
    throw error;
  }
};




/**
 * Obtener datos completos de una inmobiliaria (información + agentes)
 */
const getRealEstateComplete = async (id: number) => {
  // Primero obtenemos la información general
  const realEstate = await getRealEstateById(id);
  
  if (!realEstate) {
    return null;
  }
  
  // Luego obtenemos los agentes
  const agents = await getRealEstateAgents(id);
  
  return {
    ...realEstate,
    agents: agents
  };
};
export const getRealEstateByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.execute(
      `SELECT r.name_realestate, r.nit, CONCAT(p.name_person, ' ', p.last_name) AS responsible
       FROM realestate r
       JOIN person p ON r.person_id = p.person_id
       WHERE r.person_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No se encontró la inmobiliaria para este admin" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener inmobiliaria:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ========== EXPORTACIÓN ==========
export default {
  registerRealEstate,
  fetchAllRealEstates,
  getRealEstateStatistics,
  getRealEstateById,
  getRealEstateAgents,  // ← IMPORTANTE: Asegúrate de exportar este método
  getRealEstateComplete,
  getRealEstateByAdmin
};