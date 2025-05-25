import { Request, Response } from "express";

import User from "../Dto/UserDto";
import UserService from "../services/UserServices";


let register = async (req: Request, res: Response) => {
    try {
      const {first_name,last_name,phone, email,password } = req.body;
      console.log("📩 Datos recibidos:", first_name, last_name, email, phone, password);

      console.log("📩 Recibiendo datos del usuario:", req.body);
  
      const registerUser = await UserService.register(
        new User (first_name,last_name,phone, email,password )
      );
  
      console.log("✅ Usuario registrado con éxito ");
  
      return res.status(201).json({ status: "register ok" });
    } catch (error: any) {
      console.error("❌ Error al registrar usuario:", error);
  
      if (error && error.code == "ER_DUP_ENTRY") {
        return res.status(500).json({ errorInfo: error.sqlMessage });
      }
  
      return res.status(500).json({ error: "Error en el servidor" });
    }
  };
  

export default register;