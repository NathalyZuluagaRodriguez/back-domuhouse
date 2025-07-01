import db from "../config/config-db";

interface PropertyUpdatePayload {
  address?: string;
  description?: string;
  price?: number;
  status?: string;
  property_type_id?: number;
  socioeconomic_stratum?: number;
  city?: string;
  neighborhood?: string;
  operation_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  built_area?: number;
  total_area?: number;
  latitude?: number;
  longitude?: number;
  approved?: number;
}

class PropertyService {
  /* ---------- 1. Propiedades del agente ---------- */
static async getPropertiesByAgentId(agentId: number) {
  const sql = `
    SELECT
      p.property_id                AS propertyId,
      p.property_title             AS propertyTitle,     
      p.address                    AS address,
      p.description                AS description,
      p.image                      AS image,
      p.price                      AS price,
      p.status                     AS status,
      p.person_id                  AS personId,
      p.property_type_id           AS propertyTypeId,
      p.socioeconomic_stratum      AS socioeconomicStratum,
      p.city                       AS city,
      p.neighborhood               AS neighborhood,
      p.operation_type             AS operationType,
      p.bedrooms                   AS bedrooms,
      p.bathrooms                  AS bathrooms,
      p.parking_spaces             AS parkingSpaces,
      p.built_area                 AS builtArea,
      p.total_area                 AS totalArea,
      p.publish_date               AS publishDate,
      p.latitude                   AS latitude,
      p.longitude                  AS longitude,
      p.approved                   AS approved,

      pt.type_name                 AS propertyType,      
      per.name_person              AS agentFirstName,
      per.last_name                AS agentLastName,
      per.email                    AS agentEmail,
      per.phone                    AS agentPhone
    FROM property            p
    LEFT JOIN propertytype   pt  ON p.property_type_id = pt.property_type_id
    JOIN person              per ON p.person_id = per.person_id
    WHERE p.person_id = ?
  `;
  const [rows]: any = await db.execute(sql, [agentId]);
  return rows;
}


  /* ---------- 2. Vendidas / Alquiladas ---------- */
  static async getAgentSalesAndRentals(agentId?: number) {
    let sql = `
      SELECT
        property.property_id          AS propertyId,
        property.address              AS address,
        property.description          AS description,
        property.price                AS price,
        property.status               AS status,
        propertytype.type_name        AS propertyType,
        person.person_id              AS agentId,
        person.name_person            AS agentFirstName,
        person.last_name              AS agentLastName,
        person.email                  AS agentEmail,
        person.phone                  AS agentPhone
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

  /* ---------- 3. Reporte de desempeño ---------- */
  static async getAgentPerformanceReportById(agentId: number) {
    const sql = `
      SELECT
        person.person_id                                 AS agentId,
        person.name_person                               AS firstName,
        person.last_name                                 AS lastName,
        COUNT(DISTINCT property.property_id)             AS totalProperties,
        SUM(property.status = 'Vendida')                 AS totalSold,
        SUM(property.status = 'Alquilada')               AS totalRented
      FROM person
      LEFT JOIN property ON person.person_id = property.person_id
      WHERE person.role_id = 2 AND person.person_id = ?
      GROUP BY person.person_id
    `;
    const [rows]: any = await db.execute(sql, [agentId]);
    return rows[0];
  }

  /* ==========================================================
     NUEVAS FUNCIONES PARA Ver / Editar / Eliminar
     ========================================================== */

  /* 4. Obtener una propiedad específica del agente */
  static async getPropertyById(propertyId: number, agentId: number) {
    const sql = `
      SELECT *
      FROM property
      WHERE property_id = ? AND person_id = ?
      LIMIT 1
    `;
    const [rows]: any = await db.execute(sql, [propertyId, agentId]);
    return rows[0]; // undefined si no pertenece al agente
  }

  /* 5. Actualizar propiedad (solo columnas permitidas) */
  static async updatePropertyById(
    propertyId: number,
    agentId: number,
    payload: PropertyUpdatePayload
  ) {
    /* construimos SET dinámico */
    const fields = Object.keys(payload);
    if (fields.length === 0) return 0; // nada que actualizar

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => (payload as any)[f]);

    const sql = `
      UPDATE property
      SET ${setClause}
      WHERE property_id = ? AND person_id = ?
    `;
    const [result]: any = await db.execute(sql, [...values, propertyId, agentId]);
    return result.affectedRows; // 1 si ok, 0 si no pertenece
  }

  /* 6. Eliminar propiedad */
  static async deletePropertyById(propertyId: number, agentId: number) {
    const sql = `
      DELETE FROM property
      WHERE property_id = ? AND person_id = ?
    `;
    const [result]: any = await db.execute(sql, [propertyId, agentId]);
    return result.affectedRows; // 1 si se eliminó
  }
}

export default PropertyService;
