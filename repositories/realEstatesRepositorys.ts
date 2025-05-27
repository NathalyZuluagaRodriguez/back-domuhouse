import db from '../config/config-db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Define el tipo para la respuesta esperada de la consulta SELECT con COUNT
type QueryResult = RowDataPacket & {
  'COUNT(*)': number;
};

export const checkRealEstateExists = async (realEstateId: number): Promise<boolean> => {
  const query = 'SELECT COUNT(*) FROM RealEstate WHERE id_real_estate = ?';
  
  const [result] = await db.query<QueryResult[]>(query, [realEstateId]);
  
  return result[0]['COUNT(*)'] > 0;
};

interface NewRealEstate {
    name: string,
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

const findByNameOrEmail = async (name: string, email: string): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM RealEstate WHERE name = ? OR email = ?',
    [name, email]
  );
  return rows.length > 0;
};

const createRealEstate = async (data: NewRealEstate): Promise<boolean> => {
  const { name, nit, phone, department, city, adress, description, email, num_properties, person_id } = data;

  // Usamos ResultSetHeader para el resultado de INSERT
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO RealEstate (name, nit, phone, email, num_properties, description, department, city, adress, person_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, nit, phone, email, num_properties, description, department, city, adress, person_id]
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
  const [rows] = await db.query<RowDataPacket[] & { email: string }[]>(
    'SELECT email FROM Person WHERE person_id = ?',
    [person_id]
  );
  return rows.length > 0 ? rows[0].email : null;
};

export default {
  findByNameOrEmail,
  createRealEstate,
  checkIfAlreadyAdmin,
  personExists,
  getPersonEmail
};