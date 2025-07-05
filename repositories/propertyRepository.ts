import db from "../config/config-db"

export interface SearchFilters {
  socioeconomic_stratum?: number
  neighborhood?: string
  city?: string
  price_min?: number
  price_max?: number
  property_type_id?: number
  operation_type?: string
  bedrooms_min?: number
  bedrooms_max?: number
  bathrooms_min?: number
  bathrooms_max?: number
  parking_spaces_min?: number
  built_area_min?: number
  built_area_max?: number
  total_area_min?: number
  total_area_max?: number
  features?: string[]
  order?: string
}

// ✅ NUEVA INTERFACE PARA PROPIEDADES CON INFORMACIÓN DEL AGENTE
export interface PropertyWithAgent {
  property_id: number
  property_title: string
  address: string
  description: string
  image: string
  price: number
  status: string
  socioeconomic_stratum: number
  city: string
  neighborhood: string
  operation_type: string
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  built_area: number
  total_area: number
  publish_date: string
  latitude: number
  longitude: number
  approved: boolean
  person_id: number
  property_type_id: number
  // Información del agente
  name_person: string
  last_name: string
  agent_phone: string
  agent_email: string
  agent_name: string
  // Información del tipo de propiedad
  property_type_name: string
}

export class PropertyRepository {
  // Create property
  static async create(property: any) {
    const sql = `CALL CreateProperty(?, ?, ?, ?, ?, ?)`
    const values = [
      property.address,
      property.title,
      property.description,
      property.price,
      property.location,
      property.type,
      property.user_id,
    ]
    const [rows]: any = await db.execute(sql, values)
    return rows
  }

  // ✅ MÉTODO searchAdvanced ACTUALIZADO CON JOIN
  static async searchAdvanced(filters: SearchFilters): Promise<PropertyWithAgent[]> {
    console.log("🔍 PropertyRepository.searchAdvanced - Filtros recibidos:", filters)

    // ✅ CONSULTA BASE CON JOIN PARA OBTENER INFO DEL AGENTE
    let sql = `
      SELECT 
        p.property_id,
        p.property_title,
        p.address,
        p.description,
        p.image,
        p.price,
        p.status,
        p.socioeconomic_stratum,
        p.city,
        p.neighborhood,
        p.operation_type,
        p.bedrooms,
        p.bathrooms,
        p.parking_spaces,
        p.built_area,
        p.total_area,
        p.publish_date,
        p.latitude,
        p.longitude,
        p.approved,
        p.person_id,
        p.property_type_id,
        -- Información del agente
        person.name_person,
        person.last_name,
        person.phone as agent_phone,
        person.email as agent_email,
        CONCAT(person.name_person, ' ', person.last_name) as agent_name,
        -- Información del tipo de propiedad
        pt.type_name as property_type_name
      FROM Property p
      LEFT JOIN Person person ON p.person_id = person.person_id
      LEFT JOIN PropertyType pt ON p.property_type_id = pt.property_type_id
      WHERE p.approved = TRUE
    `

    const values: any[] = []

    // ✅ MANTENER TODOS TUS FILTROS EXISTENTES
    if (filters.socioeconomic_stratum) {
      sql += ` AND p.socioeconomic_stratum = ? `
      values.push(filters.socioeconomic_stratum)
    }

    if (filters.city) {
      sql += ` AND p.city LIKE ? `
      values.push(`%${filters.city}%`)
    }

    if (filters.neighborhood) {
      sql += ` AND p.neighborhood LIKE ? `
      values.push(`%${filters.neighborhood}%`)
    }

    if (filters.price_min) {
      sql += ` AND p.price >= ? `
      values.push(filters.price_min)
    }

    if (filters.price_max) {
      sql += ` AND p.price <= ? `
      values.push(filters.price_max)
    }

    if (filters.property_type_id) {
      sql += ` AND p.property_type_id = ? `
      values.push(filters.property_type_id)
    }

    if (filters.operation_type) {
      sql += ` AND p.operation_type = ? `
      values.push(filters.operation_type)
    }

    if (filters.bedrooms_min) {
      sql += ` AND p.bedrooms >= ? `
      values.push(filters.bedrooms_min)
    }

    if (filters.bedrooms_max) {
      sql += ` AND p.bedrooms <= ? `
      values.push(filters.bedrooms_max)
    }

    if (filters.bathrooms_min) {
      sql += ` AND p.bathrooms >= ? `
      values.push(filters.bathrooms_min)
    }

    if (filters.bathrooms_max) {
      sql += ` AND p.bathrooms <= ? `
      values.push(filters.bathrooms_max)
    }

    if (filters.parking_spaces_min) {
      sql += ` AND p.parking_spaces >= ? `
      values.push(filters.parking_spaces_min)
    }

    if (filters.built_area_min) {
      sql += ` AND p.built_area >= ? `
      values.push(filters.built_area_min)
    }

    if (filters.built_area_max) {
      sql += ` AND p.built_area <= ? `
      values.push(filters.built_area_max)
    }

    if (filters.total_area_min) {
      sql += ` AND p.total_area >= ? `
      values.push(filters.total_area_min)
    }

    if (filters.total_area_max) {
      sql += ` AND p.total_area <= ? `
      values.push(filters.total_area_max)
    }

    // ✅ ORDENAMIENTO DINÁMICO MEJORADO
    if (filters.order === "price_asc") {
      sql += ` ORDER BY p.price ASC `
    } else if (filters.order === "price_desc") {
      sql += ` ORDER BY p.price DESC `
    } else if (filters.order === "date_asc") {
      sql += ` ORDER BY p.publish_date ASC `
    } else {
      sql += ` ORDER BY p.publish_date DESC `
    }

    console.log("📋 SQL Query:", sql)
    console.log("📋 Valores:", values)

    try {
      const [rows]: any = await db.execute(sql, values)

      console.log(`✅ PropertyRepository: ${rows.length} propiedades encontradas`)

      // ✅ LOG DE EJEMPLO PARA VERIFICAR QUE INCLUYE INFO DEL AGENTE
      if (rows.length > 0) {
        console.log("📊 Ejemplo de propiedad con agente:", {
          title: rows[0].property_title,
          agent_name: rows[0].agent_name,
          name_person: rows[0].name_person,
          last_name: rows[0].last_name,
          bedrooms: rows[0].bedrooms,
          bathrooms: rows[0].bathrooms,
          operation_type: rows[0].operation_type,
        })
      }

      return rows as PropertyWithAgent[]
    } catch (err) {
      console.error("❌ Error ejecutando SQL:", err)
      throw err
    }
  }

  // ✅ MÉTODO ADICIONAL PARA OBTENER TODAS LAS PROPIEDADES APROBADAS
  static async getAllApproved(): Promise<PropertyWithAgent[]> {
    console.log("📋 PropertyRepository.getAllApproved - Obteniendo todas las propiedades aprobadas...")

    const sql = `
      SELECT 
        p.property_id,
        p.property_title,
        p.address,
        p.description,
        p.image,
        p.price,
        p.status,
        p.socioeconomic_stratum,
        p.city,
        p.neighborhood,
        p.operation_type,
        p.bedrooms,
        p.bathrooms,
        p.parking_spaces,
        p.built_area,
        p.total_area,
        p.publish_date,
        p.latitude,
        p.longitude,
        p.approved,
        p.person_id,
        p.property_type_id,
        -- Información del agente
        person.name_person,
        person.last_name,
        person.phone as agent_phone,
        person.email as agent_email,
        CONCAT(person.name_person, ' ', person.last_name) as agent_name,
        -- Información del tipo de propiedad
        pt.type_name as property_type_name
      FROM Property p
      LEFT JOIN Person person ON p.person_id = person.person_id
      LEFT JOIN PropertyType pt ON p.property_type_id = pt.property_type_id
      WHERE p.approved = TRUE
      ORDER BY p.publish_date DESC
    `

    try {
      const [rows]: any = await db.execute(sql)

      console.log(`✅ PropertyRepository: ${rows.length} propiedades aprobadas obtenidas`)

      return rows as PropertyWithAgent[]
    } catch (err) {
      console.error("❌ Error obteniendo propiedades aprobadas:", err)
      throw err
    }
  }

  // ✅ MÉTODO PARA OBTENER PROPIEDADES POR TIPO DE OPERACIÓN
  static async getByOperationType(operationType: string): Promise<PropertyWithAgent[]> {
    console.log(`🏠 PropertyRepository.getByOperationType - Tipo: ${operationType}`)

    if (!["Venta", "Arriendo"].includes(operationType)) {
      throw new Error('Tipo de operación inválido. Use "Venta" o "Arriendo"')
    }

    const filters: SearchFilters = {
      operation_type: operationType,
    }

    return await this.searchAdvanced(filters)
  }

  // ✅ MÉTODO PARA OBTENER UNA PROPIEDAD POR ID
  static async getById(propertyId: number): Promise<PropertyWithAgent | null> {
    console.log(`🏠 PropertyRepository.getById - ID: ${propertyId}`)

    const sql = `
      SELECT 
        p.*,
        person.name_person,
        person.last_name,
        person.phone as agent_phone,
        person.email as agent_email,
        CONCAT(person.name_person, ' ', person.last_name) as agent_name,
        pt.type_name as property_type_name
      FROM Property p
      LEFT JOIN Person person ON p.person_id = person.person_id
      LEFT JOIN PropertyType pt ON p.property_type_id = pt.property_type_id
      WHERE p.property_id = ? AND p.approved = 1
    `

    try {
      const [rows]: any = await db.execute(sql, [propertyId])

      if (!rows || rows.length === 0) {
        return null
      }

      console.log(`✅ PropertyRepository: Propiedad ${propertyId} encontrada`)

      return rows[0] as PropertyWithAgent
    } catch (err) {
      console.error("❌ Error obteniendo propiedad por ID:", err)
      throw err
    }
  }
}
