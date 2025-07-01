import db from "../config/config-db";

class ClientService {
  /* ────────────────────────────
     1️⃣  Listar todos los clientes
     ──────────────────────────── */
  static async getAllClients() {
    const sql = `
      SELECT
        person_id   AS clientId,
        name_person AS name,
        last_name   AS lastName,
        email,
        phone
      FROM person
      WHERE role_id = 3
    `;
    const [rows]: any = await db.execute(sql);
    return rows; // siempre un array
  }

  /* ────────────────────────────
     2️⃣  Buscar cliente por email
     ──────────────────────────── */
  static async findByEmail(email: string) {
    const [rows]: any = await db.execute(
      "SELECT person_id AS clientId FROM person WHERE email = ? AND role_id = 3 LIMIT 1",
      [email]
    );
    return rows.length ? rows[0].clientId : null;
  }
}

export default ClientService;
