import db from '../config/config-db';
import bcrypt from "bcryptjs";
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';
import Agent from '../Dto/AgentsDto';

class usuarioRepo {

  static async createUser(Person: User) {
    const sql = 'CALL CreateUser(?, ?, ?, ?, ?, ?)';
    const values = [Person.first_name, Person.last_name, Person.phone, Person.email, Person.password, 3];
    return db.execute(sql, values);
  }

  static async searchUser(login: Login) {
    try {
      console.log("🔍 Buscando usuario con email:", login.email);
      
      const sql = 'CALL loginUser(?)';
      const values = [login.email];
      const [rows]: any = await db.execute(sql, values);

      console.log("📊 Filas devueltas por la base de datos:", rows);

      // ✅ PROBLEMA POTENCIAL: Verificar estructura de respuesta del procedimiento
      let user;
      if (Array.isArray(rows) && rows.length > 0) {
        // Si el procedimiento devuelve un array de arrays
        if (Array.isArray(rows[0]) && rows[0].length > 0) {
          user = rows[0][0];
        } else {
          // Si el procedimiento devuelve directamente un array de objetos
          user = rows[0];
        }
      }

      if (!user) {
        console.log("❌ Usuario no encontrado");
        return { logged: false, status: "Usuario no encontrado" };
      }

      console.log("🔍 Usuario encontrado:", {
        id: user.person_id,
        email: user.email,
        first_name: user.first_name,
        hasPassword: !!user.password
      });

      if (!user.password) {
        console.error("❌ El usuario no tiene contraseña almacenada");
        return { logged: false, status: "Error en la configuración del usuario" };
      }

      console.log("🔐 Verificando contraseña...");
      const isPasswordValid = await bcrypt.compare(login.password, user.password);

      if (isPasswordValid) {
        console.log("✅ Contraseña válida");
        return {
          logged: true,
          status: "Successful authentication",
          id: user.person_id,
          first_name: user.first_name,
          email: user.email,
          avatar: user.avatar || null
        };
      }

      console.log("❌ Contraseña inválida");
      return { logged: false, status: "Contraseña incorrecta" };

    } catch (error: any) {
      console.error("❌ Error en searchUser:", error);
      throw new Error(`Error al buscar usuario: ${error?.message || error}`);
    }
  }

  static async CreateAgent(agent: Agent) {
    const sql = 'CALL CreateAgent(?, ?, ?, ?, ?, ?, ?)';
    const values = [
      agent.name_person,   // 👈 aquí cambió
      agent.last_name,
      agent.phone,
      agent.email,
      agent.password,
      agent.realEstateId,
      agent.roleId
    ];
  
    try {
      const [rows]: any = await db.execute(sql, values);
      return rows;
    } catch (error) {
      console.error("❌ Error ejecutando procedimiento CrearAgente:", error);
      throw error;
    }
  }

  static async Verifysingleemail(email: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM usuario WHERE email = ?';
    const [rows]: any = await db.execute(query, [email]);
    const count = rows[0][0].count;
    return count === 0; // true si no existe ese correo
  }

  static async insertSolicitud(nombre: string, apellido: string, correo: string, telefono: string, password: string, idInmobiliaria: number) {
    const sql = 'CALL InsertarSolicitudAgente(?, ?, ?, ?, ?, ?)';
    const values = [nombre, apellido, correo, telefono, password, idInmobiliaria];
    return db.execute(sql, values);
  }
  
  static async listSolicitudes() {
    const sql = 'SELECT * FROM solicitudes_agente';
    const [rows]: any = await db.execute(sql);
    return rows[0];
  }
  
  static async approveSolicitud(id: number) {
    const sql = 'CALL AprobarSolicitudAgente(?)';
    return db.execute(sql, [id]);
  }
  
  static async rejectSolicitud(id: number, justificacion: string | null = null) {
    const sql = 'CALL RechazarSolicitudAgente(?, ?)';
    return db.execute(sql, [id, justificacion]);
  }
  
  static async cancelSolicitud(id: number) {
    const sql = 'CALL CancelarSolicitudAgente(?)';
    return db.execute(sql, [id]);
  }
  
}


export default usuarioRepo;