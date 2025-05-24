import db from "../config/config-db"; // Asegúrate de que este sea tu conector a MySQL

class PropertyService {
  static async getPropertiesByAgentId(id_persona: number) {
    const sql = `
  SELECT 
    p.id_propiedad,
    p.direccion,
    p.descripcion,
    p.precio,
    p.estado,
    t.nombre_tipo_propiedad,
    per.id_persona,
    per.nombre AS nombre_agente,
    per.apellido AS apellido_agente,
    per.correo AS correo_agente,
    per.telefono AS telefono_agente
  FROM Propiedad p
  LEFT JOIN Tipo_Propiedad t ON p.id_tipo_propiedad = t.id_tipo_propiedad
  JOIN Persona per ON p.id_persona = per.id_persona
  WHERE p.id_persona = ?
`;

    const [rows]: any = await db.execute(sql, [id_persona]);
    return rows;
  }


  
}
export const getVentasAlquileresAgente = async (id_agente?: number) => {
  let sql = `
    SELECT 
      p.id_propiedad,
      p.direccion,
      p.descripcion,
      p.precio,
      p.estado,
      t.nombre_tipo_propiedad,
      per.id_persona AS id_agente,
      per.nombre AS nombre_agente,
      per.apellido AS apellido_agente,
      per.correo AS correo_agente,
      per.telefono AS telefono_agente
    FROM Propiedad p
    LEFT JOIN Tipo_Propiedad t ON p.id_tipo_propiedad = t.id_tipo_propiedad
    JOIN Persona per ON p.id_persona = per.id_persona
    WHERE p.estado IN ('Vendida', 'Alquilada')
  `;

  const params: any[] = [];

  if (id_agente) {
    sql += " AND per.id_persona = ?";
    params.push(id_agente);
  }

  const [rows]: any = await db.execute(sql, params);
  return rows;
};


export const getAgentePerformanceReportById = async (idAgente: number) => {
  const sql = `
    SELECT
      per.id_persona AS id_agente,
      per.nombre,
      per.apellido,
      COUNT(DISTINCT prop.id_propiedad) AS total_propiedades,
      SUM(CASE WHEN prop.estado = 'Vendida' THEN 1 ELSE 0 END) AS total_vendidas,
      SUM(CASE WHEN prop.estado = 'Alquilada' THEN 1 ELSE 0 END) AS total_alquiladas,
      COUNT(DISTINCT vis.id_visita) AS total_visitas
    FROM Persona per
    LEFT JOIN Propiedad prop ON per.id_persona = prop.id_persona
    LEFT JOIN Visita vis ON vis.id_propiedad = prop.id_propiedad
    WHERE per.id_rol = 2 AND per.id_persona = ?
    GROUP BY per.id_persona;
  `;

  const [rows]: any = await db.execute(sql, [idAgente]);
  return rows;
};
export default PropertyService;
