import db from "../config/config-db";

class PropertyService {
  // ---------- 1. Properties owned by the agent ----------
  static async getPropertiesByAgentId(agentId: number) {
    const sql = `
      SELECT
        property.property_id          AS propertyId,
        property.address              AS address,
        property.description          AS description,
        property.price                AS price,
        property.status               AS status,
        propertytype.type_name        AS propertyType,
        person.person_id             AS agentId,
        person.name_person           AS agentFirstName,
        person.last_name             AS agentLastName,
        person.email                 AS agentEmail,
        person.phone                 AS agentPhone
      FROM property
      LEFT JOIN propertytype
        ON property.property_type_id = propertytype.property_type_id
      JOIN person
        ON property.person_id = person.person_id
      WHERE property.person_id = ?
    `;

    const [rows]: any = await db.execute(sql, [agentId]);
    return rows;
  }

  // ---------- 2. Sold / Rented properties (agent filter optional) ----------
  static async getAgentSalesAndRentals(agentId?: number) {
    let sql = `
      SELECT
        property.property_id          AS propertyId,
        property.address              AS address,
        property.description          AS description,
        property.price                AS price,
        property.status               AS status,
        propertytype.type_name        AS propertyType,
        person.person_id             AS agentId,
        person.name_person           AS agentFirstName,
        person.last_name             AS agentLastName,
        person.email                 AS agentEmail,
        person.phone                 AS agentPhone
      FROM property
      LEFT JOIN propertytype
        ON property.property_type_id = propertytype.property_type_id
      JOIN person
        ON property.person_id = person.person_id
      WHERE property.status IN ('sold', 'rented')
    `;

    const params: any[] = [];
    if (agentId) {
      sql += " AND person.person_id = ?";
      params.push(agentId);
    }

    const [rows]: any = await db.execute(sql, params);
    return rows;
  }

  // ---------- 3. Performance report ----------
  static async getAgentPerformanceReportById(agentId: number) {
    const sql = `
      SELECT
        person.person_id                                 AS agentId,
        person.name_person                               AS firstName,
        person.last_name                                 AS lastName,
        COUNT(DISTINCT property.property_id)             AS totalProperties,
        SUM(CASE WHEN property.status = 'sold' THEN 1 ELSE 0 END)     AS totalSold,
        SUM(CASE WHEN property.status = 'rented' THEN 1 ELSE 0 END)   AS totalRented,
        COUNT(DISTINCT visit.visit_id)                   AS totalVisits
      FROM person
      LEFT JOIN property
        ON person.person_id = property.person_id
      LEFT JOIN visit
        ON visit.property_id = property.property_id
      WHERE person.role_id = 2
        AND person.person_id = ?
      GROUP BY person.person_id
    `;

    const [rows]: any = await db.execute(sql, [agentId]);
    return rows[0]; // Return single report row
  }
}

export default PropertyService;
