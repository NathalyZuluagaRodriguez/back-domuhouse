// En roleRepository.ts
import { Pool } from 'mysql2/promise';
import db from '../config/config-db'; // ajusta si tu conexión está en otro archivo

export class RoleRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async getAllRoles(): Promise<any[]> {
    const [rows] = await this.pool.query('SELECT * FROM ROL');
    return rows as any[];
  }

  async createRole(nombre_rol: string): Promise<any> {
    const [result] = await this.pool.query(
      'INSERT INTO ROL (nombre_rol) VALUES (?)',
      [nombre_rol]
    );
    return result;
  }

  // En roleRepository.ts (añade este método a tu clase existente)
  async updateRole(id: number, nombre_rol: string): Promise<any> {
    const [result] = await this.pool.query(
      'UPDATE ROL SET nombre_rol = ? WHERE id_rol = ?',
      [nombre_rol, id]
    );
    return result;
  }
  
  
  // También puedes añadir un método para verificar si existe un rol
  async getRoleById(id: number): Promise<any> {
    const [rows] = await this.pool.query('SELECT * FROM ROL WHERE id_rol = ?', [id]);
    const roles = rows as any[];
    return roles.length > 0 ? roles[0] : null;
  }
  

  async deleteRoleById(id: number): Promise<any> {
    const [result] = await this.pool.query(
      'DELETE FROM rol WHERE id_rol = ?',
      [id]
    );
    return result;
  }
  
}