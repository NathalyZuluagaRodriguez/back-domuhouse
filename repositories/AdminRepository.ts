import db from '../config/config-db';

interface AdminData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  password: string;
  id_rol: number;
}

export const insertAdmin = async (data: AdminData) => {
  const query = `
    INSERT INTO Persona (nombre, apellido, telefono, correo, password, id_rol)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [data.nombre, data.apellido, data.telefono, data.correo, data.password, data.id_rol];

  const [result] = await db.execute(query, values);
  return result;
};


export const deleteAdmin = async (correo: string) => {
  const query = `
    DELETE FROM Persona 
    WHERE correo = ? AND id_rol = 1
  `;
  const [result] = await db.execute(query, [correo]);
  return result;
}
