import db from '../config/config-db';
import { RowDataPacket } from 'mysql2';

class AgentTokenRepository {
  static async validateToken(token: string): Promise<number> {
    const [rows]: [RowDataPacket[], any] = await db.execute(
      `SELECT id_inmobiliaria, fecha_creacion,
      DATE_ADD(fecha_creacion, INTERVAL 7 DAY) as fecha_expiracion,
      NOW() as fecha_actual
      FROM invitationtoken
      WHERE token = ? AND usado = 0`,
      [token]
    );

    if (!rows.length) {
      throw new Error('Token not found or already used');
    }

    const tokenData = rows[0];
    if (new Date(tokenData.fecha_actual) > new Date(tokenData.fecha_expiracion)) {
      throw new Error('Token has expired');
    }

    return tokenData.id_inmobiliaria;
  }

  static async markTokenUsed(token: string): Promise<void> {
    await db.execute(
      "UPDATE invitationtoken SET usado = TRUE WHERE token = ?",
      [token]
    );
  }

  static async createAgentWithToken(
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    password: string,
    idInmobiliaria: number
  ): Promise<void> {
    try {
      await db.execute(
        "CALL CrearAgenteConToken(?, ?, ?, ?, ?, ?)",
        [nombre, apellido, email, telefono, password, idInmobiliaria]
      );
    } catch (error) {
      console.error("Error in createAgentWithToken:", error);
      throw new Error('Error creating agent in the database');
    }
  }
}

export default AgentTokenRepository;
