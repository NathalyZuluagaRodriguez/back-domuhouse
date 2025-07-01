import db from "../config/config-db";

class VisitService {
  /* ================================
     Listar visitas de un agente
     ================================ */
  static async getVisitsByAgentId(agentId: number) {
    /**
     *  - visit           → tabla de visitas
     *  - property        → para título/dirección
     *  - person  (alias c)→ cliente que pidió la visita  (person.role_id = 3  ‑cliente‑)
     *  - person  (alias a)→ agente dueño de la propiedad (person.role_id = 2)
     *
     *  Nota: ajusta los JOIN según tu esquema real (p.ej. si tienes tabla booking).
     */
    const sql = `
      SELECT
        v.visit_id                AS visitId,
        DATE(v.visit_date)        AS visitDate,
        TIME(v.visit_date)        AS visitTime,
        v.status                  AS visitStatus,

        /* datos de la propiedad */
        p.property_id             AS propertyId,
        p.property_title          AS propertyTitle,
        p.address                 AS propertyAddress,

        /* datos del cliente que agenda la visita */
        c.person_id               AS clientId,
        c.name_person             AS clientName,
        c.phone                   AS clientPhone,

        /* agente dueño (por si lo necesitas) */
        a.person_id               AS agentId,
        a.name_person             AS agentName
      FROM visit v
      JOIN property  p ON p.property_id = v.property_id
      JOIN person    a ON a.person_id   = p.person_id       /* agente dueño */
      JOIN person    c ON c.person_id   = v.person_id       /* cliente */
      WHERE a.person_id = ?
      ORDER BY v.visit_date DESC
    `;

    const [rows]: any = await db.execute(sql, [agentId]);
    return rows;              // array de visitas
  }
  /* =======================================================
   Crear visita nueva  — devuelve el registro insertado
   ======================================================= */
  static async createVisit(
  agentId: number,
  propertyId: number,
  clientId: number,
  visitDate: string,
  status: "Pendiente" | "Confirmada" | "Cancelada" = "Pendiente",
  visitType?: string,
  notes?: string
) {
  // 1. Verificar propiedad
  const [propRows]: any = await db.execute(
    "SELECT 1 FROM property WHERE property_id = ? AND person_id = ? LIMIT 1",
    [propertyId, agentId]
  );
  if (propRows.length === 0) throw new Error("La propiedad no pertenece a este agente");

  // 2. Verificar cliente
  const [clientRows]: any = await db.execute(
    "SELECT 1 FROM person WHERE person_id = ? AND role_id = 3 LIMIT 1",
    [clientId]
  );
  if (clientRows.length === 0) {
    throw new Error("El cliente no existe o no tiene rol válido");
  }

  // 3. Insertar visita
  const insertSql = `
    INSERT INTO visit (visit_date, status, property_id, person_id, visit_type, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result]: any = await db.execute(insertSql, [
    visitDate,
    status,
    propertyId,
    clientId,
    visitType || null,
    notes || null
  ]);

  // 4. Devolver la visita creada
  const [rows]: any = await db.execute(
    "SELECT * FROM visit WHERE visit_id = ?",
    [result.insertId]
  );
  return rows[0];
}


  /* FUNCIONALIDADES VER, EDITAR Y ELIMINAR */

  /* ─────────────────────────────
      1️⃣ Cambiar solo el estado
   ───────────────────────────── */
  static async updateStatus(visitId: number, status: "Pendiente" | "Confirmada" | "Cancelada") {
    const allowed = ["Pendiente", "Confirmada", "Cancelada"]
    if (!allowed.includes(status)) throw new Error("Estado no válido")

    const [result]: any = await db.execute(
      "UPDATE visit SET status = ? WHERE visit_id = ?",
      [status, visitId]
    )
    if (result.affectedRows === 0) throw new Error("Visita no encontrada")

    /* devuelve la visita actualizada */
    const [rows]: any = await db.execute(
      "SELECT * FROM visit WHERE visit_id = ?",
      [visitId]
    )
    return rows[0]
  }

  /* ─────────────────────────────
     2️⃣ Editar campos completos
  ───────────────────────────── */
  static async updateVisit(
    visitId: number,
    {
      visitDate,
      visitTime,
      status,
      propertyId,
      clientId,
    }: {
      visitDate?: string;
      visitTime?: string;
      status?: "Pendiente" | "Confirmada" | "Cancelada";
      propertyId?: number;
      clientId?: number;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    // Unir fecha y hora solo si se proporciona ambos
    if (visitDate && visitTime) {
      const fullDateTime = `${visitDate} ${visitTime}`;
      fields.push("visit_date = ?");
      values.push(fullDateTime);
    } else if (visitDate && !visitTime) {
      fields.push("visit_date = ?");
      values.push(visitDate); // por si solo cambian la fecha completa
    }

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }

    if (propertyId) {
      fields.push("property_id = ?");
      values.push(propertyId);
    }

    if (clientId) {
      fields.push("person_id = ?");
      values.push(clientId);
    }

    if (fields.length === 0) throw new Error("Nada que actualizar");

    values.push(visitId); // para el WHERE

    const sql = `UPDATE visit SET ${fields.join(", ")} WHERE visit_id = ?`;
    const [result]: any = await db.execute(sql, values);
    if (result.affectedRows === 0) throw new Error("Visita no encontrada");

    const [rows]: any = await db.execute(
      "SELECT * FROM visit WHERE visit_id = ?",
      [visitId]
    );
    return rows[0];
  }


  /* ─────────────────────────────
     3️⃣ Eliminar visita
  ───────────────────────────── */
  static async deleteVisit(visitId: number) {
    const [result]: any = await db.execute(
      "DELETE FROM visit WHERE visit_id = ?",
      [visitId]
    )
    if (result.affectedRows === 0) throw new Error("Visita no encontrada")
    return { message: "Visita eliminada" }
  }
}




export default VisitService;
