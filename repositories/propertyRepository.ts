import db from '../config/config-db';

export class PropertyRepository {
  // Crear propiedad
  static async create(property: any) {
    const sql = `CALL CrearPropiedad(?, ?, ?, ?, ?, ?)`;
    const values = [
      property.titulo,
      property.descripcion,
      property.precio,
      property.ubicacion,
      property.tipo, // venta/alquiler
      property.usuario_id
    ];
    const [rows]: any = await db.execute(sql, values);
    return rows;
  }

  // Búsqueda avanzada
  static async buscarPropiedadesAvanzado(filtros: any): Promise<any[]> {
  let sql = `SELECT * FROM Propiedad WHERE 1=1`;
  const values: any[] = [];

  if (filtros.estrato) {
    sql += ` AND estrato = ?`;
    values.push(Number(filtros.estrato));
  }

  if (filtros.ciudad) {
    sql += ` AND ciudad LIKE ?`;
    values.push(`%${filtros.ciudad}%`);
  }

  if (filtros.barrio) {
    sql += ` AND barrio LIKE ?`;
    values.push(`%${filtros.barrio}%`);
  }

  if (filtros.precio_min) {
    sql += ` AND precio >= ?`;
    values.push(Number(filtros.precio_min));
  }

  if (filtros.precio_max) {
    sql += ` AND precio <= ?`;
    values.push(Number(filtros.precio_max));
  }

  if (filtros.tipo_propiedad) {
    sql += ` AND id_tipo_propiedad = ?`;
    values.push(Number(filtros.tipo_propiedad));
  }

  if (filtros.tipo_operacion) {
    sql += ` AND tipo_operacion = ?`;
    values.push(filtros.tipo_operacion);
  }

  if (filtros.habitaciones_min) {
    sql += ` AND habitaciones >= ?`;
    values.push(Number(filtros.habitaciones_min));
  }

  if (filtros.habitaciones_max) {
    sql += ` AND habitaciones <= ?`;
    values.push(Number(filtros.habitaciones_max));
  }

  if (filtros.banos_min) {
    sql += ` AND banos >= ?`;
    values.push(Number(filtros.banos_min));
  }

  if (filtros.banos_max) {
    sql += ` AND banos <= ?`;
    values.push(Number(filtros.banos_max));
  }

  if (filtros.parqueaderos_min) {
    sql += ` AND parqueaderos >= ?`;
    values.push(Number(filtros.parqueaderos_min));
  }

  if (filtros.area_min) {
    sql += ` AND area_construida >= ?`;
    values.push(Number(filtros.area_min));
  }

  if (filtros.area_max) {
    sql += ` AND area_construida <= ?`;
    values.push(Number(filtros.area_max));
  }

  sql += ` ORDER BY fecha_publicacion DESC`;

  const [rows]: any = await db.execute(sql, values);
  return rows;
}

}


  

