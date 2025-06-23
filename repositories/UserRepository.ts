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

  static async createAgente(agente: Agent) {
    const sql = 'CALL CrearAgente(?, ?, ?, ?, ?, ?, ?)';
    const values = [
      agente.nombre,
      agente.apellido,
      agente.telefono,
      agente.email,
      agente.password,
      agente.id_inmobiliaria,
      agente.id_rol
    ];
    try {
      const [rows]: any = await db.execute(sql, values);
      return rows;
    } catch (error) {
      console.error("❌ Error ejecutando procedimiento CrearAgente:", error);
      throw error;
    }
  }

  static async actualizarContrasena(email: string, nuevaContrasena: string) {
    const sql = 'CALL sp_actualizar_contrasena(?, ?)';
    const values = [email, nuevaContrasena];
    return db.execute(sql, values);
  }
}

export default UserRepository;