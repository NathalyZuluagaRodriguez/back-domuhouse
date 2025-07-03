import db from "../config/config-db";

class VisitService {
  /* =============================================================
     Listar visitas de un agente
     ============================================================= */
  static async getVisitsByAgentId(agentId: number) {
    const sql = `
      SELECT
        v.visit_id                AS visitId,
        DATE(v.visit_date)        AS visitDate,
        TIME(v.visit_date)        AS visitTime,
        v.status                  AS visitStatus,
        /* Propiedad */
        p.property_id             AS propertyId,
        p.property_title          AS propertyTitle,
        p.address                 AS propertyAddress,
        /* Cliente */
        c.person_id               AS clientId,
        c.name_person             AS clientName,
        c.phone                   AS clientPhone,
        /* Agente dueño */
        a.person_id               AS agentId,
        a.name_person             AS agentName
      FROM visit v
      JOIN property p ON p.property_id = v.property_id
      JOIN person   a ON a.person_id   = p.person_id     /* agente */
      JOIN person   c ON c.person_id   = v.person_id     /* cliente */
      WHERE a.person_id = ?
      ORDER BY v.visit_date DESC
    `;
    const [rows]: any = await db.execute(sql, [agentId]);
    return rows;
  }

  /* =============================================================
     Crear visita NUEVA (verifica solapamiento de 1 hora)
     ============================================================= */
  static async createVisit(
    agentId: number,
    propertyId: number,
    clientId: number,
    visitDate: string, // "YYYY‑MM‑DD HH:MM"
    status: "Pendiente" | "Confirmada" | "Cancelada" = "Pendiente",
    visitType?: string,
    notes?: string
  ) {
    /* 1️⃣ Verificar que la propiedad es del agente */
    const [propRows]: any = await db.execute(
      "SELECT 1 FROM property WHERE property_id = ? AND person_id = ? LIMIT 1",
      [propertyId, agentId]
    );
    if (propRows.length === 0) throw new Error("La propiedad no pertenece a este agente");

    /* 2️⃣ Verificar cliente válido */
    const [clientRows]: any = await db.execute(
      "SELECT 1 FROM person WHERE person_id = ? AND role_id = 3 LIMIT 1",
      [clientId]
    );
    if (clientRows.length === 0) throw new Error("El cliente no existe o no tiene rol válido");

    /* 3️⃣ Verificar SOLAPAMIENTO de 1 hora */
    const overlapSql = `
      SELECT 1
      FROM visit v
      JOIN property p ON p.property_id = v.property_id
      WHERE p.person_id = ?                                  /* mismo agente */
        AND v.visit_date < DATE_ADD(?, INTERVAL 1 HOUR)       /* existing_start < new_end */
        AND DATE_ADD(v.visit_date, INTERVAL 1 HOUR) > ?       /* existing_end   > new_start */
      LIMIT 1
    `;
    const [overlap]: any = await db.execute(overlapSql, [agentId, visitDate, visitDate]);
    if (overlap.length > 0)
      throw new Error("Ya hay una visita programada en ese horario");

    /* 4️⃣ Insertar visita */
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

    /* 5️⃣ Devolver la visita creada */
    const [rows]: any = await db.execute("SELECT * FROM visit WHERE visit_id = ?", [
      result.insertId
    ]);
    return rows[0];
  }

  /* =============================================================
     Cambiar SOLO el estado
     ============================================================= */
  static async updateStatus(
    visitId: number,
    status: "Pendiente" | "Confirmada" | "Cancelada"
  ) {
    const allowed = ["Pendiente", "Confirmada", "Cancelada"];
    if (!allowed.includes(status)) throw new Error("Estado no válido");

    const [result]: any = await db.execute(
      "UPDATE visit SET status = ? WHERE visit_id = ?",
      [status, visitId]
    );
    if (result.affectedRows === 0) throw new Error("Visita no encontrada");

    const [rows]: any = await db.execute("SELECT * FROM visit WHERE visit_id = ?", [visitId]);
    return rows[0];
  }

  /* =============================================================
     Editar visita (fecha, hora, etc.)
     ============================================================= */
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

    if (visitDate && visitTime) {
      fields.push("visit_date = ?");
      values.push(`${visitDate} ${visitTime}`);
    } else if (visitDate) {
      fields.push("visit_date = ?");
      values.push(visitDate);
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
    values.push(visitId);

    const sql = `UPDATE visit SET ${fields.join(", ")} WHERE visit_id = ?`;
    const [result]: any = await db.execute(sql, values);
    if (result.affectedRows === 0) throw new Error("Visita no encontrada");

    const [rows]: any = await db.execute("SELECT * FROM visit WHERE visit_id = ?", [visitId]);
    return rows[0];
  }

  /* =============================================================
     Eliminar visita
     ============================================================= */
  static async deleteVisit(visitId: number) {
    const [result]: any = await db.execute("DELETE FROM visit WHERE visit_id = ?", [visitId]);
    if (result.affectedRows === 0) throw new Error("Visita no encontrada");
    return { message: "Visita eliminada" };
  }
}

export default VisitService;
