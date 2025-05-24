import db from '../config/config-db'; // Ajusta si usas otra conexión

export const obtenerReportePropiedades = async () => {
  const [rows] = await db.execute(`
    SELECT 
      p.id_propiedad,
      p.direccion,
      p.descripcion,
      p.precio,
      p.estado,
      t.nombre_tipo_propiedad,
      CONCAT(per.nombre, ' ', per.apellido) AS agente,
      per.correo AS correo_agente
    FROM Propiedad p
    JOIN Tipo_Propiedad t ON p.id_tipo_propiedad = t.id_tipo_propiedad
    JOIN Persona per ON p.id_persona = per.id_persona
    WHERE p.estado IN ('Vendida', 'Alquilada', 'Disponible')
  `);
  return rows;
};
