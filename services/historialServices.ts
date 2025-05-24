import db from '../config/config-db';

export const obtenerHistorial = async () => {
  const [rows] = await db.query(`
    SELECT ha.id_actividad, ha.id_agente, p.nombre, p.apellido, ha.accion, ha.fecha
    FROM HistorialActividad ha
    JOIN Persona p ON p.id_persona = ha.id_agente
    ORDER BY ha.fecha DESC
  `);
  return rows;
};

export const registrarActividad = async (id_agente: number, accion: string) => {
  await db.query('INSERT INTO HistorialActividad (id_agente, accion) VALUES (?, ?)', [id_agente, accion]);
};
