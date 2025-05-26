import db from '../config/config-db';

interface AdminData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  role_id: number;
}

export const insertAdmin = async (data: AdminData) => {
    console.log("🔍 Valores recibidos en insertAdmin:", data);

  const query = `
    INSERT INTO Person (first_name, last_name, phone, email, password, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [data.first_name, data.last_name, data.phone, data.email, data.password, data.role_id];

  const [result] = await db.execute(query, values);
  return result;
};


export const deleteAdmin = async (correo: string) => {
  const query = `
    DELETE FROM Person
    WHERE email = ? AND role_id = 1
  `;
  const [result] = await db.execute(query, [correo]);
  return result;
}
