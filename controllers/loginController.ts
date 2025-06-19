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
  name_person?: string;
  email?: string;
  avatar?: string;
  role_id?: number;
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: "Error", 
        message: "Email y contraseña son requeridos" 
      });
    }

    console.log("🔐 Intento de login para:", email);

    const loginResult: LoginResponse = await usuarioServi.login(new Login(email, password));

    console.log("📋 Resultado completo del login:", loginResult);

    // 🔧 VALIDACIÓN CORRECTA - VERIFICAR QUE logged SEA true
    if (loginResult.logged === true) {
      
      // VERIFICAR QUE TODOS LOS CAMPOS NECESARIOS EXISTAN
      if (!loginResult.id || !loginResult.name_person || loginResult.role_id === undefined) {
        console.error("❌ DATOS FALTANTES EN EL RESULTADO:", {
          id: loginResult.id,
          name_person: loginResult.name_person,
          role_id: loginResult.role_id
        });
        return res.status(500).json({ 
          status: "error",
          message: "Error del sistema: Datos de usuario incompletos" 
        });
      }

      const userData = {
        id: loginResult.id,
        name_person: loginResult.name_person,
        email: loginResult.email || email,
        avatar: loginResult.avatar || null,
        role_id: loginResult.role_id
      };

      console.log("✅ Login exitoso - Datos del usuario:", userData);
      console.log("🎯 Role ID para redirección:", userData.role_id);

      return res.status(200).json({
        status: "success",
        token: generateToken({
          id: userData.id,
          name_person: userData.name_person,
          email: userData.email,
          role_id: userData.role_id
        }, 5),
        user: userData,
      });
    }

    // 🔧 Si el login falló (logged === false)
    console.log("❌ Login fallido - Razón:", loginResult.status);
    return res.status(401).json({ 
      status: "error",
      message: loginResult.status || "Credenciales incorrectas" 
    });

  } catch (error: any) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ 
      status: "error",
      message: "Error en el servidor",
      details: error.message 
    });
  }
};

export default login;