import db from '../config/config-db';

interface AdminData {
  name_person: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  role_id: number;
}

export const insertAdmin = async (data: AdminData) => {
    console.log("🔍 Valores recibidos en insertAdmin:", data);

  const query = `
    INSERT INTO Person (name_person, last_name, phone, email, password, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [data.name_person, data.last_name, data.phone, data.email, data.password, data.role_id];

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
