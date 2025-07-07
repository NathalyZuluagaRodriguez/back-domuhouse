import db from '../config/config-db'
import { RowDataPacket } from 'mysql2'

interface FiltroVisitas {
  fecha?: string
  agente?: number
  estado?: string
  busqueda?: string
}

const buscarVisitas = async (filtros: FiltroVisitas) => {
  let query = `
    SELECT 
      v.visit_id,
      v.visit_date,
      v.status,
      v.visit_type,
      v.notes,
      p.address AS propiedad,
      p.city,
      p.price,
      c.name AS cliente,
      c.phone AS cliente_telefono,
      a.name AS agente,
      a.phone AS agente_telefono
    FROM visit v
    JOIN property p ON v.property_id = p.property_id
    JOIN person c ON v.person_id = c.person_id
    JOIN person a ON p.person_id = a.person_id
    WHERE 1 = 1
  `

  const params: any[] = []

  if (filtros.fecha) {
    query += ` AND DATE(v.visit_date) = ?`
    params.push(filtros.fecha)
  }

  if (filtros.agente) {
    query += ` AND a.person_id = ?`
    params.push(filtros.agente)
  }

  if (filtros.estado) {
    query += ` AND v.status = ?`
    params.push(filtros.estado)
  }

  if (filtros.busqueda) {
    query += ` AND (c.name LIKE ? OR p.address LIKE ?)`
    params.push(`%${filtros.busqueda}%`, `%${filtros.busqueda}%`)
  }

  const [rows] = await db.query<RowDataPacket[]>(query, params)
  return rows
}

export default {
  buscarVisitas
}
