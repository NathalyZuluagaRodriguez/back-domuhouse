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

interface NewRealEstate {
  name_realestate: string;
  nit: string;
  phone: string;
  email: string;
  num_properties: number;
  department: string;
  city: string;
  adress: string;
  description: string;
  person_id: number;
}

const findByNameOrEmail = async (name_realestate: string, email: string): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM RealEstate WHERE name_realestate = ? OR email = ?',
    [name_realestate, email]
  );
  return rows.length > 0;
};

const createRealEstate = async (data: NewRealEstate): Promise<boolean> => {
  const {
    name_realestate,
    nit,
    phone,
    department,
    city,
    adress,
    description,
    email,
    num_properties,
    person_id,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO RealEstate (name_realestate, nit, phone, email, num_properties, description, department, city, adress, person_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name_realestate, nit, phone, email, num_properties, description, department, city, adress, person_id]
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

// 🆕 Tipo y función para estadísticas de inmobiliarias
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
