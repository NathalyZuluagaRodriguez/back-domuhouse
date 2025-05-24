import pool from '../config/config-db';
import { PropertyIaDto } from '../Dto/propertyIaDto';

export const crearPropiedad = async (dto: PropertyIaDto) => {
  const [result]: any = await pool.query(
    'INSERT INTO Propiedad (direccion, descripcion, precio, estado, id_persona, id_tipo_propiedad) VALUES (?, ?, ?, ?, ?, ?)',
    [dto.direccion, dto.descripcion, dto.precio, dto.estado, dto.id_persona, dto.id_tipo_propiedad]
  );

  return {
    id: result.insertId,
    ...dto
  };
};
