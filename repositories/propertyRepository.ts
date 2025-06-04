import db from '../config/config-db';

export interface SearchFilters {
  socioeconomic_stratum?: number;
  neighborhood?: string;
  city?: string;
  price_min?: number;
  price_max?: number;
  property_type_id?: number;
  operation_type?: string;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  parking_spaces_min?: number;
  built_area_min?: number;
  built_area_max?: number;
  total_area_min?: number;
  total_area_max?: number;
  features?: string[];
  order?: string;
}

export class PropertyRepository {
  // Create property
  static async create(property: any) {
    const sql = `CALL CreateProperty(?, ?, ?, ?, ?, ?)`;
    const values = [
      property.address,
      property.title,
      property.description,
      property.price,
      property.location,
      property.type,
      property.user_id
    ];
    const [rows]: any = await db.execute(sql, values);
    return rows;
  }

  // Advanced search
  static async searchAdvanced(filters: SearchFilters): Promise<any[]> {
    let sql = ` SELECT * FROM Property WHERE 1=1 AND approved = TRUE `;
    const values: any[] = [];

    if (filters.socioeconomic_stratum) {
      sql +=  ` AND socioeconomic_stratum = ? `;
      values.push(filters.socioeconomic_stratum);
    }

    if (filters.city) {
      sql +=  ` AND city LIKE ? `;
      values.push(`%${filters.city}%`);
    }

    if (filters.neighborhood) {
      sql +=  ` AND neighborhood LIKE ? `;
      values.push(`%${filters.neighborhood}%`);
    }

    if (filters.price_min) {
      sql +=  ` AND price >= ? `;
      values.push(filters.price_min);
    }

    if (filters.price_max) {
      sql += ` AND price <= ? `;
      values.push(filters.price_max);
    }

    if (filters.property_type_id) {
      sql +=  ` AND property_type_id = ? `;
      values.push(filters.property_type_id);
    }

    if (filters.operation_type) {
      sql += ` AND operation_type = ? `;
      values.push(filters.operation_type);
    }

    if (filters.bedrooms_min) {
      sql += ` AND bedrooms >= ? `;
      values.push(filters.bedrooms_min);
    }

    if (filters.bedrooms_max) {
      sql += ` AND bedrooms <= ? `;
      values.push(filters.bedrooms_max);
    }

    if (filters.bathrooms_min) {
      sql += ` AND bathrooms >= ? `;
      values.push(filters.bathrooms_min);
    }

    if (filters.bathrooms_max) {
      sql +=  ` AND bathrooms <= ? `;
      values.push(filters.bathrooms_max);
    }

    if (filters.parking_spaces_min) {
      sql +=  ` AND parking_spaces >= ? `;
      values.push(filters.parking_spaces_min);
    }

    if (filters.built_area_min) {
      sql +=  ` AND built_area >= ? `;
      values.push(filters.built_area_min);
    }

    if (filters.built_area_max) {
      sql +=  ` AND built_area <= ? `;
      values.push(filters.built_area_max);
    }

    if (filters.total_area_min) {
      sql += ` AND total_area >= ? `;
      values.push(filters.total_area_min);
    }

    if (filters.total_area_max) {
      sql += ` AND total_area <= ?` ;
      values.push(filters.total_area_max);
    }

    // Ordenamiento dinÃ¡mico
    if (filters.order === 'price_asc') {
      sql +=  ` ORDER BY price ASC `;
    } else if (filters.order === 'price_desc') {
      sql +=  ` ORDER BY price DESC `;
    } else {
      sql +=  ` ORDER BY publish_date DESC `;
    }

    try {
      const [rows]: any = await db.execute(sql, values);
      return rows;
    } catch (err) {
      console.error("Error ejecutando SQL:", err);
      throw err;
    }
  }
}