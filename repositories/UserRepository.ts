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
// Agente

static async verifySingleEmail(email: string): Promise<boolean> {
  const sql  = 'SELECT COUNT(*) AS count FROM person WHERE email = ?';
  const [rows]: any = await db.execute(sql, [email]);

  console.log('🟡 rows:', JSON.stringify(rows, null, 2));

  // 1. rows==[]  → treat as "email not found"
  if (!Array.isArray(rows) || rows.length === 0) return true;

  // 2. CALL shape → rows[0] is the first result-set
  if (Array.isArray(rows[0])) {
    return (rows[0][0]?.count ?? 0) === 0;
  }

  // 3. Plain SELECT shape
  return (rows[0]?.count ?? 0) === 0;
}


static async insertAgentJoinRequest(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password: string,
  realEstateId: number
) {
  const sql = 'CALL InsertAgentJoinRequest(?, ?, ?, ?, ?, ?)';
  const values = [firstName, lastName, email, phone, password, realEstateId];
  return db.execute(sql, values);
}

static async listAgentJoinRequests() {
  const sql = 'SELECT * FROM agent_join_requests';
  const [rows]: any = await db.execute(sql);
  return rows[0];
}

static async approveAgentJoinRequest(id: number) {
  const sql = 'CALL ApproveAgentJoinRequest(?)';
  return db.execute(sql, [id]);
}

static async rejectAgentJoinRequest(id: number, justification: string | null = null) {
  const sql = 'CALL RejectAgentJoinRequest(?, ?)';
  return db.execute(sql, [id, justification]);
}

static async cancelAgentJoinRequest(id: number) {
  const sql = 'CALL CancelAgentJoinRequest(?)';
  return db.execute(sql, [id]);
}

}


export default usuarioRepo;