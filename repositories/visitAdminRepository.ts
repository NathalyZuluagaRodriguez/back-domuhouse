import db from '../config/config-db'

const getAllVisits = async () => {
  const [rows] = await db.execute(`
    SELECT 
      v.visit_id, 
      v.visit_date, 
      v.status, 
      v.property_id, 
      v.person_id, 
      v.visit_type, 
      v.notes,

      -- Datos de la persona
      p.name_person AS nombre,
      p.phone AS telefono,

      -- Datos de la propiedad
      pr.property_title  AS nombre_propiedad,
      pr.address AS direccion

    FROM visit v
    JOIN person p ON v.person_id = p.person_id
    JOIN property pr ON v.property_id = pr.property_id;
  `)
  return rows
}

export default {
  getAllVisits
}
