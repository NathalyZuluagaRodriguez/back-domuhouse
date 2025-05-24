import db from '../config/config-db';

export class AgendaRepository {
  async crearVisita(fecha_visita: string, id_propiedad: number, id_persona: number) {
    const [result] = await db.execute(
      'INSERT INTO Visita (fecha_visita, id_propiedad, id_persona) VALUES (?, ?, ?)',
      [fecha_visita, id_propiedad, id_persona]
    );
    return result;
  }

  async obtenerVisitasPorUsuario(id_persona: number) {
    const [rows] = await db.execute(
      `SELECT v.id_visita, v.fecha_visita, v.estado, 
              p.nombre AS nombre_persona, p.apellido, pr.direccion AS direccion_propiedad
       FROM Visita v
       JOIN Persona p ON v.id_persona = p.id_persona
       JOIN Propiedad pr ON v.id_propiedad = pr.id_propiedad
       WHERE v.id_persona = ?`,
      [id_persona]
    );
    return rows;
  }
  

  async actualizarVisita(id_visita: number, fecha_visita: string) {
    const [result] = await db.execute(
      'UPDATE Visita SET fecha_visita = ? WHERE id_visita = ?',
      [fecha_visita, id_visita]
    );
    return result;
  }

  async confirmarVisita(id_visita: number) {
    const [result] = await db.execute(
      "UPDATE Visita SET estado = 'Confirmada' WHERE id_visita = ?",
      [id_visita]
    );
    return result;
  }

  async obtenerDisponibilidad(fecha: string) {
    const [rows] = await db.execute(
      'SELECT * FROM Visita WHERE DATE(fecha_visita) = ?',
      [fecha]
    );
    return rows;
  }

  async listarPersonas() {
    const [rows] = await db.execute(
      'SELECT id_persona, CONCAT(nombre, " ", apellido) AS nombre_completo FROM Persona'
    );
    return rows;
  }

  async listarPropiedades() {
    const [rows] = await db.execute(
      'SELECT id_propiedad, direccion FROM Propiedad'
    );
    return rows;
  }
}
