import { Request, Response } from "express";
import usuarioServi from "../services/UserServices";
import Login from "../Dto/loginDto";
import generateToken from '../Helpers/generateToken';
import { validateEmailQuick, validateEmailDelivery, sendUserNotFoundEmail } from "../utils/emailService"; // Importar las funciones de validación
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

    // 🔍 VALIDACIÓN RÁPIDA DE EMAIL ANTES DEL LOGIN
    console.log("📧 Validando formato de email...");
    const quickValidation = await validateEmailQuick(email);
    
    if (!quickValidation.isValid) {
      console.log(`❌ Email inválido: ${email} - Razón: ${quickValidation.reason}`);
      return res.status(400).json({
        status: "error",
        message: `Email inválido: ${quickValidation.reason}`,
        emailValidation: {
          isValid: false,
          reason: quickValidation.reason,
          validationMethod: "quick"
        }
      });
    }

    console.log("✅ Email válido, procediendo con autenticación...");

    const loginResult: LoginResponse = await usuarioServi.login(new Login(email, password));

    if (loginResult.logged === true) {
      // ✅ LOGIN EXITOSO
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

      console.log("✅ Login exitoso para:", userData.email);

      // 🔍 VALIDACIÓN COMPLETA EN SEGUNDO PLANO (OPCIONAL)
      // Ejecutar validación completa sin bloquear la respuesta
      validateEmailDelivery(email).then(fullValidation => {
        if (!fullValidation.canReceive) {
          console.warn(`⚠️ ADVERTENCIA: Usuario logueado con email que no puede recibir mensajes:`, {
            email,
            reason: fullValidation.reason,
            method: fullValidation.validationMethod
          });
          // Aquí podrías registrar esto en logs o base de datos para seguimiento
        } else {
          console.log(`✅ Email completamente validado para usuario logueado: ${email}`);
        }
      }).catch(error => {
        console.error("❌ Error en validación completa en segundo plano:", error);
      });

      return res.status(200).json({
        status: "success",
        token: generateToken({
          id: userData.id,
          name_person: userData.name_person,
          email: userData.email,
          role_id: userData.role_id
        }, 5),
        user: userData,
        emailValidation: {
          isValid: true,
          reason: "Email válido (verificación rápida)",
          validationMethod: "quick"
        }
      });
    }

    // ❌ LOGIN FALLIDO - VALIDAR EMAIL ANTES DE ENVIAR NOTIFICACIÓN
    console.log("❌ Login fallido para:", email);
    
    // 🔍 VALIDACIÓN COMPLETA PARA EMAILS DE LOGIN FALLIDO
    console.log("📧 Realizando validación completa para email de login fallido...");
    const fullValidation = await validateEmailDelivery(email);
    
    if (fullValidation.canReceive) {
      // Solo enviar email si el email puede recibirlo
      try {
        await sendUserNotFoundEmail(email);
        console.log(`📧 Email de 'usuario no encontrado' enviado a: ${email}`);
      } catch (emailError) {
        console.error("⚠️ Error enviando email de usuario no encontrado:", emailError);
      }
    } else {
      console.log(`🚫 No se envió email de 'usuario no encontrado' - Email no puede recibir: ${email}`);
      console.log(`📋 Razón: ${fullValidation.reason} (Método: ${fullValidation.validationMethod})`);
    }

    return res.status(401).json({ 
      status: "error",
      message: "Credenciales incorrectas",
      emailValidation: {
        isValid: fullValidation.isValid,
        canReceive: fullValidation.canReceive,
        reason: fullValidation.reason,
        validationMethod: fullValidation.validationMethod
      }
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

// 🔍 ENDPOINT ADICIONAL PARA VALIDAR EMAIL POR SEPARADO (OPCIONAL)
export const validateEmailEndpoint = async (req: Request, res: Response) => {
  try {
    const { email, method = 'quick' } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email es requerido"
      });
    }

    let validation;
    
    if (method === 'full') {
      console.log(`🔍 Validación completa solicitada para: ${email}`);
      validation = await validateEmailDelivery(email);
    } else {
      console.log(`⚡ Validación rápida solicitada para: ${email}`);
      const quickResult = await validateEmailQuick(email);
      validation = {
        isValid: quickResult.isValid,
        canReceive: quickResult.isValid, // Asumimos que puede recibir si es válido
        reason: quickResult.reason,
        validationMethod: 'quick'
      };
    }

    return res.status(200).json({
      status: "success",
      email,
      validation: {
        isValid: validation.isValid,
        canReceive: validation.canReceive,
        reason: validation.reason,
        validationMethod: validation.validationMethod
      }
    });

  } catch (error: any) {
    console.error("❌ Error validando email:", error);
    return res.status(500).json({
      status: "error",
      message: "Error validando email",
      details: error.message
    });
  }
};

export default login;