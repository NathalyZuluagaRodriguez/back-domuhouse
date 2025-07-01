import db from '../config/config-db';
import { RowDataPacket } from 'mysql2';

class AgentTokenRepository {
  /* ───────────────────────────────
   * Valida el token y devuelve el ID
   * de la inmobiliaria asociada.
   * ─────────────────────────────── */
  static async validateToken(token: string): Promise<number> {
    const [rows]: [RowDataPacket[], any] = await db.execute(
      `SELECT  id_real_estate AS realEstateId,
               created_at,
               DATE_ADD(created_at, INTERVAL 7 DAY) AS expiration_date,
               NOW()                                AS now_date
         FROM  InvitationToken
        WHERE  token = ? AND used = 0`,
      [token]
    );

    if (!rows.length) {
      throw new Error('Token not found or already used');
    }

    const data = rows[0];
    if (new Date(data.now_date) > new Date(data.expiration_date)) {
      throw new Error('Token has expired');
    }

    return data.realEstateId;
  }

  /** Marca el token como utilizado */
  static async markTokenUsed(token: string): Promise<void> {
    await db.execute(
      'UPDATE InvitationToken SET used = TRUE WHERE token = ?',
      [token]
    );
  }

  /* ───────────────────────────────
   * Crea al agente mediante el
   * procedimiento almacenado.
   * Espera 6 argumentos en este orden:
   * namePerson, lastName, email,
   * phone, password, realEstateId
   * ─────────────────────────────── */
  static async createAgentWithToken(
    namePerson: string,
    lastName: string,
    phone: string,
    email: string,
    password: string,
    realEstateId: number
  ): Promise<void> {
    try {
      await db.execute(
        'CALL CreateAgentWithToken(?, ?, ?, ?, ?, ?)',
        [namePerson, lastName, phone, email, password, realEstateId]
      );
    } catch (err: any) {
      console.error('MySQL error:', err.sqlMessage || err.message);
      throw new Error(err.sqlMessage || 'Error creating agent in the database');
    }
  }
}

export default AgentTokenRepository;
