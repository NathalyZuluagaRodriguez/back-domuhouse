import { Request, Response } from "express";
import usuarioServi from "../services/UserServices";
import Login from "../Dto/loginDto";
import generateToken from '../Helpers/generateToken';
import dotenv from "dotenv";

dotenv.config();

interface LoginResponse {
  logged: boolean;
  status: string;
  id?: number;
  first_name?: string;
  email?: string;
  avatar?: string;
}

const login = async (req: Request, res: Response) => {
  try {
    // ✅ AGREGAR: Validación de datos de entrada
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email y contraseña son requeridos" 
      });
    }

    console.log("🔐 Intento de login para:", email);
    
    const login: LoginResponse = await usuarioServi.login(new Login(email, password));

    console.log("📋 Resultado del login:", login);

    if (login.logged && login.id && login.first_name) {
      const userData = {
        id: login.id,
        first_name: login.first_name,
        email: login.email,
        avatar: login.avatar ?? null,
      };

      console.log("✅ Login exitoso para usuario:", userData.first_name);

      return res.status(200).json({
        status: login.status,
        token: generateToken({
          id: login.id,
          first_name: login.first_name,
          email: login.email,
        }, 5),
        user: userData,
      });
    }

    console.log("❌ Login fallido:", login.status);
    return res.status(401).json({ status: login.status });

  } catch (error: any) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ 
      error: "Error en el servidor",
      details: error.message 
    });
  }
};

export default login;