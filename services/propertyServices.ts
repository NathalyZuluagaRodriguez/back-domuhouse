import db from "../config/config-db";

// Payload completo y obligatorio
interface PropertyPayload {
  property_title: string;
  address: string;
  description: string;
  price: number;
  status: string;
  property_type_id: number;
  socioeconomic_stratum: number;
  city: string;
  neighborhood: string;
  operation_type: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  built_area: number;
  total_area: number;
  latitude: number;
  longitude: number;
  image: string;
}

class PropertyService {
 static async createProperty(agentId: number, payload: PropertyPayload) {
  let sql = `
    INSERT INTO Property (
      person_id, property_title, address, description, price, status,
      property_type_id, socioeconomic_stratum, city, neighborhood, operation_type,
      bedrooms, bathrooms, parking_spaces, built_area, total_area,
      latitude, longitude, image, publish_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  let values = [
    agentId,
    payload.property_title,
    payload.address,
    payload.description,
    payload.price,
    payload.status, // "Disponible" si no envías uno diferente
    payload.property_type_id,
    payload.socioeconomic_stratum,
    payload.city,
    payload.neighborhood,
    payload.operation_type,
    payload.bedrooms,
    payload.bathrooms,
    payload.parking_spaces,
    payload.built_area,
    payload.total_area,
    payload.latitude,
    payload.longitude,
    payload.image,
  ];

  let [result]: any = await db.execute(sql, values);
  return result.insertId;
}

  // 1. Listar propiedades por agente
  static async getPropertiesByAgentId(agentId: number) {
    const sql = `
      SELECT
        p.property_id AS propertyId,
        p.property_title AS propertyTitle,
        p.address,
        p.description,
        p.image,
        p.price,
        p.status,
        p.person_id AS personId,
        p.property_type_id AS propertyTypeId,
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
        pt.type_name AS propertyType,
        per.name_person AS agentFirstName,
        per.last_name AS agentLastName,
        per.email AS agentEmail,
        per.phone AS agentPhone
      FROM property p
      LEFT JOIN propertytype pt ON p.property_type_id = pt.property_type_id
      JOIN person per ON p.person_id = per.person_id
      WHERE p.person_id = ?
    `;

    const [rows]: any = await db.execute(sql, [agentId]);
    return rows;
  }

  // 2. Propiedades vendidas o alquiladas
  static async getAgentSalesAndRentals(agentId?: number) {
    let sql = `
      SELECT
        property.property_id AS propertyId,
        property.address,
        property.description,
        property.price,
        property.status,
        propertytype.type_name AS propertyType,
        person.person_id AS agentId,
        person.name_person AS agentFirstName,
        person.last_name AS agentLastName,
        person.email AS agentEmail,
        person.phone AS agentPhone
      FROM property
      LEFT JOIN propertytype ON property.property_type_id = propertytype.property_type_id
      JOIN person ON property.person_id = person.person_id
      WHERE property.status IN ('Vendida', 'Alquilada')
    `;

    const params: any[] = [];
    if (agentId) {
      sql += " AND person.person_id = ?";
      params.push(agentId);
    }

    const [rows]: any = await db.execute(sql, params);
    return rows;
  }

  // 3. Reporte de desempeño del agente
  static async getAgentPerformanceReportById(agentId: number) {
    const sql = `
      SELECT
        person.person_id AS agentId,
        person.name_person AS firstName,
        person.last_name AS lastName,
        COUNT(DISTINCT property.property_id) AS totalProperties,
        SUM(property.status = 'Vendida') AS totalSold,
        SUM(property.status = 'Alquilada') AS totalRented
      FROM person
      LEFT JOIN property ON person.person_id = property.person_id
      WHERE person.role_id = 2 AND person.person_id = ?
      GROUP BY person.person_id
    `;

    const [rows]: any = await db.execute(sql, [agentId]);
    return rows[0];
  }

  // 4. Obtener propiedad por ID
  static async getPropertyById(propertyId: number, agentId: number) {
    const sql = `
      SELECT *
      FROM property
      WHERE property_id = ? AND person_id = ?
      LIMIT 1
    `;
    const [rows]: any = await db.execute(sql, [propertyId, agentId]);
    return rows[0];
  }

  // 5. Actualizar propiedad
  static async updatePropertyById(
    propertyId: number,
    agentId: number,
    payload: PropertyPayload
  ) {
    const fields = Object.keys(payload);
    if (fields.length === 0) return 0;

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => (payload as any)[f]);

    const sql = `
      UPDATE property
      SET ${setClause}
      WHERE property_id = ? AND person_id = ?
    `;

    const [result]: any = await db.execute(sql, [...values, propertyId, agentId]);
    return result.affectedRows;
  }

  // 6. Eliminar propiedad
  static async deletePropertyById(propertyId: number, agentId: number) {
    const sql = `
      DELETE FROM property
      WHERE property_id = ? AND person_id = ?
    `;
    const [result]: any = await db.execute(sql, [propertyId, agentId]);
    return result.affectedRows;
  }
}

export default PropertyService;
