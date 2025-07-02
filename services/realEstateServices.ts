import realEstateRepo from "../repositories/realEstatesRepositorys";
import sendEmail from "../utils/sendEmailer"; 
import pool from '../config/config-db';

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

export const fetchAllRealEstates = async (): Promise<any[]> => {
  return await realEstateRepo.getAllRealEstates();
};

export const getRealEstateStatistics = async () => {
    return await realEstateRepo.getRealEstateStats();
};

/**
 * Obtener una inmobiliaria específica por ID
 */
const getRealEstateById = async (id: number) => {
  const query = `
    SELECT 
      re.id_realestate,
      re.name_realestate,
      re.nit,
      re.phone,
      re.email,
      re.department,
      re.city,
      re.adress,
      re.description,
      re.num_properties,
      p.name as responsable_name,
      p.last_name as responsable_lastname
    FROM real_estate re
    LEFT JOIN person p ON re.person_id = p.id_person
    WHERE re.id_realestate = ?
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
      a.id_agent,
      p.name,
      p.last_name,
      p.email,
      p.phone,
      a.specialization,
      a.status,
      COUNT(pr.id_property) as num_properties,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM agent a
    INNER JOIN person p ON a.person_id = p.id_person
    LEFT JOIN property pr ON a.id_agent = pr.agent_id
    LEFT JOIN review r ON a.id_agent = r.agent_id
    WHERE a.realestate_id = ? AND a.status = 'Activo'
    GROUP BY a.id_agent, p.name, p.last_name, p.email, p.phone, a.specialization, a.status
    ORDER BY p.name
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

// ========== EXPORTACIÓN ==========
export default {
  registerRealEstate,
  fetchAllRealEstates,
  getRealEstateStatistics,
  getRealEstateById,
  getRealEstateAgents,  // ← IMPORTANTE: Asegúrate de exportar este método
  getRealEstateComplete
};