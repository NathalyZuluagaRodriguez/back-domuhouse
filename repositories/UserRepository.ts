import db from '../config/config-db';
import bcrypt from "bcryptjs";
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';
import Agent from '../Dto/AgentsDto';



class usuarioRepo {

 static async createUsuario( Persona:User){
    const sql = 'CALL CrearUsuario(?, ?, ?, ?, ?, ?)';
      const values = [Persona.nombre,Persona.apellido,Persona.telefono, Persona.correo,Persona.password, 2];
      return db.execute(sql, values);
  }

    
  static async buscarUsuario(login: Login) {
    const sql = 'call loginUsuario(?)';
    const values = [login.email];
    const [rows]: any = await db.execute(sql, values);

    if (rows.length > 0) {
      const usuario = rows[0][0];
      
      console.log("🔍 Usuario encontrado:", usuario); // Verifica que la contraseña se esté recuperando correctamente

      if (!usuario.password) {
        throw new Error("El usuario no tiene contraseña almacenada");
      }

      // Compara la contraseña ingresada con el hash almacenado
      const isPasswordValid = await bcrypt.compare(login.password, usuario.password);

      if (isPasswordValid) {
        return { logged: true, status: "Successful authentication", id: usuario.id_usuario };
      }

      return { logged: false, status: "Invalid password" };
 
    }
    return { logged: false, status: "Invalid username or password" };

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

}
export default usuarioRepo;

