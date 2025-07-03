import db from "../config/config-db"

class InterestService {
    static async listInterests() {
        const [rows]: any = await db.execute(`
    SELECT 
      ClientInterest.id_interest AS idInterest,
      ClientInterest.status,
      ClientInterest.update_date,
      Person.person_id AS personId,
      CONCAT(Person.name_person, ' ', Person.last_name) AS clientName,
      Person.email,
      Person.phone,
      Property.property_id AS propertyId,
      Property.property_title AS propertyTitle   
    FROM ClientInterest
    JOIN Person   ON ClientInterest.id_person   = Person.person_id
    JOIN Property ON ClientInterest.id_property = Property.property_id
  `)
        return rows
    }


    static async updateInterestStatus(idInterest: number, newStatus: string, agentId: number) {
        // Obtener el estado anterior
        const [rows]: any = await db.execute(
            "SELECT status FROM ClientInterest WHERE id_interest = ?",
            [idInterest]
        )
        if (!rows.length) throw new Error("Interest not found")

        const previousStatus = rows[0].status

        // Actualizar el nuevo estado
        await db.execute(
            "UPDATE ClientInterest SET status = ? WHERE id_interest = ?",
            [newStatus, idInterest]
        )

        // Registrar en historial
        await db.execute(`
      INSERT INTO InterestHistory (id_interest, previous_status, new_status, id_agent)
      VALUES (?, ?, ?, ?)`,
            [idInterest, previousStatus, newStatus, agentId]
        )
    }
}

export default InterestService
