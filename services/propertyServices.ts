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

  
// 👤 Para cuando un USUARIO (cliente) crea una propiedad
static async createPropertyByUser(userId: number, payload: PropertyPayload) {
  const sql = `
    INSERT INTO Property (
      person_id, property_title, address, description, price, status,
      property_type_id, socioeconomic_stratum, city, neighborhood, operation_type,
      bedrooms, bathrooms, parking_spaces, built_area, total_area,
      latitude, longitude, image, publish_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    userId,
    payload.property_title,
    payload.address,
    payload.description,
    payload.price,
    payload.status,
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

  const [result]: any = await db.execute(sql, values);
  return result.insertId;
}
   /* --------------- NUEVO: resumen global de ventas ---------------- */
  static async getGlobalSalesSummary(agentId?: number) {
    let sql = `
      SELECT
        COALESCE(SUM(property.price), 0) AS totalSales,
        COUNT(property.property_id)      AS soldProperties
      FROM property
      WHERE property.status IN ('Vendida', 'Alquilada')
    `;

    const params: any[] = [];
    if (agentId) {
      sql += " AND property.person_id = ?";
      params.push(agentId);
    }

    const [rows]: any = await db.execute(sql, params);
    return rows[0]; // { totalSales, soldProperties }
  }

      /* -------------- NUEVO: cantidad de propiedades vendidas -------------- */
  static async getTotalSoldProperties(agentId?: number) {
    let sql = `
      SELECT COUNT(*) AS totalSold
      FROM property
      WHERE status = 'Vendida'
    `;

    const params: any[] = [];
    if (agentId) {
      sql += " AND person_id = ?";
      params.push(agentId);
    }

    const [rows]: any = await db.execute(sql, params);
    return rows[0]; // { totalSold: número }
  }

    /* -------- NUEVO: ventas agrupadas por tipo de propiedad -------- */
static async getSalesByPropertyType(agentId?: number) {
  // Usa LET (no const) porque la vas a modificar después
  let sql = `
    SELECT
      pt.type_name          AS tipo,
      SUM(p.price)          AS ventas
    FROM property p
    JOIN propertytype pt ON p.property_type_id = pt.property_type_id
    WHERE p.status = 'Vendida'
  `;

  const params: any[] = [];
  if (agentId) {
    sql += " AND p.person_id = ?";
    params.push(agentId);
  }

  sql += " GROUP BY pt.type_name";

  const [rows]: any = await db.execute(sql, params);

  // Mapeo final (sin porcentaje)
  return rows.map((r: any) => ({
    tipo: r.tipo,
    ventas: r.ventas,
  }));
}

static async getTopAgents(limit: number = 5) {
  const LIM = Number.isInteger(limit) && limit > 0 ? limit : 5; // sanitizar

  let sql = `
    SELECT
      per.person_id,
      CONCAT(per.name_person, ' ', per.last_name) AS nombre,
      COUNT(p.property_id)       AS ventas,
      SUM(p.price)               AS totalVentas
    FROM property p
    JOIN person per ON p.person_id = per.person_id
    WHERE p.status = 'Vendida'
      AND per.role_id = 2
    GROUP BY per.person_id
    ORDER BY ventas DESC
    LIMIT ${LIM}                     -- ← ya no es un placeholder
  `;

  /*  Si más adelante quisieras filtrar por agentId:
      const params: any[] = [agentId];
      sql = sql.replace('WHERE', 'WHERE p.person_id = ? AND');
      const [rows]: any = await db.execute(sql, params);
  */
  const [rows]: any = await db.execute(sql);   // ← sin array de params

  const COMISION_RATE = 0.05;
  const totalVentasGlobal = rows.reduce((acc: number, r: any) => acc + r.ventas, 0);

  const topAgentes = rows.map((r: any) => ({
    nombre: r.nombre,
    ventas: r.ventas,
    porcentaje: totalVentasGlobal
      ? Number(((r.ventas / totalVentasGlobal) * 100).toFixed(1))
      : 0,
    comisiones: Math.round(r.totalVentas * COMISION_RATE)
  }));

  return topAgentes;
}
}

  




export default PropertyService;