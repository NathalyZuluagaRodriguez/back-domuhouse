import db from '../config/config-db';
import bcrypt from "bcryptjs";
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';
import Agent from '../Dto/AgentsDto';

class UserRepository {

static async createUser(Person: User) {
  const sql = 'CALL CreateUser(?, ?, ?, ?, ?, ?)';
  const values = [
    Person.name_person,  // p_first_name
    Person.last_name,    // p_last_name
    Person.email,        // p_email
    Person.phone,        // p_phone 👉 CORRECTO AQUÍ
    Person.password,     // p_password 👉 AHORA AQUÍ
    Person.role_id       // p_role_id
  ];
  return db.execute(sql, values);
}

 

  static async searchUser(login: Login) {
    try {
      console.log("🔍 Buscando usuario con email:", login.email);

      const sql = 'CALL loginUser(?)';
      const values = [login.email];
      const [rows]: any = await db.execute(sql, values);

      console.log("📊 Filas devueltas por la base de datos:", JSON.stringify(rows, null, 2));

      // EXTRAER EL USUARIO CORRECTAMENTE
      let user = null;
      
      if (Array.isArray(rows) && rows.length > 0) {
        const resultSet = rows[0];
        if (Array.isArray(resultSet) && resultSet.length > 0) {
          user = resultSet[0];
        }
      }

      console.log("👤 USUARIO RAW EXTRAÍDO:", user);

      if (!user) {
        console.log("❌ Usuario no encontrado");
        return { logged: false, status: "Usuario no encontrado" };
      }

      // VERIFICAR CAMPOS OBLIGATORIOS ANTES DE CONTINUAR
      if (!user.person_id || !user.email || !user.name_person || !user.password || user.role_id === undefined) {
        console.error("❌ DATOS INCOMPLETOS DEL USUARIO:", {
          person_id: user.person_id,
          email: user.email,
          name_person: user.name_person,
          password: !!user.password,
          role_id: user.role_id
        });
        return { logged: false, status: "Error en los datos del usuario" };
      }

      console.log("🔐 Verificando contraseña...");
      const isPasswordValid = await bcrypt.compare(login.password, user.password);

      if (!isPasswordValid) {
        console.log("❌ Contraseña inválida");
        return { logged: false, status: "Contraseña incorrecta" };
      }

      console.log("✅ Contraseña válida");
      
      // 🔧 CONSTRUIR RESPUESTA CORRECTA - ESTA ES LA SOLUCIÓN
      const resultado = {
        logged: true,
        status: "Successful authentication",
        id: user.person_id,
        name_person: user.name_person.trim(), 
        email: user.email,
        avatar: user.avatar || null,
        role_id: parseInt(user.role_id, 10) // ✅ AHORA SÍ INCLUYE role_id
      };

      console.log("📤 RESULTADO FINAL A DEVOLVER:", resultado);
      return resultado;

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


export default UserRepository;