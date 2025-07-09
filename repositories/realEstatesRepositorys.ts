// ===== REPOSITORIO (realEstatesRepositorys.ts) =====
import db from '../config/config-db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Define el tipo para la respuesta esperada de la consulta COUNT
type QueryResult = RowDataPacket & {
  'COUNT(*)': number;
};

export const checkRealEstateExists = async (realEstateId: number): Promise<boolean> => {
  const query = 'SELECT COUNT(*) FROM RealEstate WHERE id_real_estate = ?';
  const [result] = await db.query<QueryResult[]>(query, [realEstateId]);
  return result[0]['COUNT(*)'] > 0;
};

// ✅ INTERFACE MODIFICADA - num_properties REMOVIDO
interface NewRealEstate {
  name_realestate: string;
  nit: string;
  phone: string;
  email: string;
  department: string;
  city: string;
  address: string;
  description: string;
  person_id: number;
    logo_url?: string; // ✅ Agregar logo_url

}

const findByNameOrEmail = async (name_realestate: string, email: string): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM RealEstate WHERE name_realestate = ? OR email = ?',
    [name_realestate, email]
  );
  return rows.length > 0;
};

// ✅ FUNCIÓN MODIFICADA - num_properties REMOVIDO DE LA INSERCIÓN
const createRealEstate = async (data: NewRealEstate): Promise<boolean> => {
  const {
    name_realestate,
    nit,
    phone,
    department,
    city,
    address,
    description,
    email,
    person_id,
    logo_url,
  } = data;

  // ✅ QUERY MODIFICADA - num_properties removido
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO RealEstate (name_realestate, nit, phone, email, description, department, city, adress, person_id, logo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name_realestate, nit, phone, email, description, department, city, person_id, logo_url]
  );
  
  return result.affectedRows === 1;
};

const checkIfAlreadyAdmin = async (person_id: number): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM RealEstate WHERE person_id = ?',
    [person_id]
  );
  return rows.length > 0;
};

const personExists = async (person_id: number): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM Person WHERE person_id = ?',
    [person_id]
  );
  return rows.length > 0;
};

const getPersonEmail = async (person_id: number): Promise<string | null> => {
  const [rows] = await db.query<(RowDataPacket & { email: string })[]>(
    'SELECT email FROM Person WHERE person_id = ?',
    [person_id]
  );
  return rows.length > 0 ? rows[0].email : null;
};

export const getAllRealEstates = async (): Promise<RowDataPacket[]> => {
  const query = 'SELECT re.*, p.name_person as admin_name, p.last_name as admin_lastname FROM realestate re JOIN person p ON re.person_id = p.person_id';
  const [rows] = await db.query<RowDataPacket[]>(query);
  return rows;
};

// ✅ FUNCIÓN MODIFICADA - Ahora cuenta propiedades dinámicamente
type RealEstateStatsResult = RowDataPacket & {
  total_properties: number;
  total_real_estates: number;
  avg_properties_per_real_estate: number;
};

const getRealEstateStats = async (): Promise<RealEstateStatsResult> => {
  const [rows] = await db.query<RealEstateStatsResult[]>(`
    SELECT 
      (SELECT COUNT(*) FROM property) AS total_properties,
      (SELECT COUNT(*) FROM realEstate) AS total_real_estates,
      (
        SELECT COUNT(*) / NULLIF(COUNT(DISTINCT realEstate.person_id), 0)
        FROM property 
        INNER JOIN realEstate ON realEstate.person_id = property.person_id
      ) AS avg_properties_per_real_estate
  `);
  return rows[0];
};

export default {
  findByNameOrEmail,
  createRealEstate,
  checkIfAlreadyAdmin,
  personExists,
  getPersonEmail,
  getAllRealEstates,
  getRealEstateStats
};