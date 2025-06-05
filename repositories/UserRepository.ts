import db from '../config/config-db';
import bcrypt from "bcryptjs";
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';

class usuarioRepo {

 static async createUser( Person:User){
    const sql = 'CALL CreateUser(?, ?, ?, ?, ?, ?)';
      const values = [Person.first_name,Person.last_name,Person.phone, Person.email,Person.password, 3];
      return db.execute(sql, values);
  }

    
  static async searchUser(login: Login) {
    const sql = 'call loginUser(?)';
  const values = [login.email];
  const [rows]: any = await db.execute(sql, values);

  if (rows.length > 0) {
    const user = rows[0][0];
    
    console.log("🔍 Usuario encontrado:", user);

    if (!user.password) {
      throw new Error("El usuario no tiene contraseña almacenada");
    }

    const isPasswordValid = await bcrypt.compare(login.password, user.password);

    if (isPasswordValid) {
      return {
        logged: true,
        status: "Successful authentication",
        id: user.person_id,
        first_name: user.first_name,
        email: user.email,
      };
    }

    return { logged: false, status: "Invalid password" };
  }

  return { logged: false, status: "Invalid username or password" };

}

  static async updatePassword(email: string, newPassword: string) {
    const sql = 'CALL sp_update_password(?, ?)';
    const values = [email, newPassword];
    return db.execute(sql, values);
  }

}

export default usuarioRepo;

