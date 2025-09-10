import { Request, Response } from "express";
import User from "../Dto/UserDto";
import UserService from "../services/UserServices";
import { 
  sendWelcomeEmail, 
  isValidEmailFormat, 
  isDisposableEmail,
  validateEmailDelivery 
} from "../utils/emailService";
import promisePool from "../config/config-db";

// 🎯 CONFIGURACIÓN DE ROLES ÚNICOS
const UNIQUE_ROLES = [1, 2]; // Solo admin (1) y super admin (2) son únicos

const register = async (req: Request, res: Response) => {
  try {
    const { name_person, last_name, phone, email, password, role_id = 3 } = req.body;

    console.log("📩 Datos recibidos:", { name_person, last_name, phone, email, role_id });

    // 🔍 VALIDACIÓN 1: FORMATO DE EMAIL
    if (!isValidEmailFormat(email)) {
      console.log(`❌ Formato de email inválido: ${email}`);
      return res.status(400).json({ 
        status: "error",
        message: "El formato del correo electrónico no es válido" 
      });
    }

    // 🔍 VALIDACIÓN 2: EMAIL DESECHABLE
    if (isDisposableEmail(email)) {
      console.log(`❌ Email desechable detectado: ${email}`);
      return res.status(400).json({ 
        status: "error",
        message: "No se permiten correos temporales o desechables. Usa un email permanente." 
      });
    }

    // 🔍 VALIDACIÓN 3: EMAIL DUPLICADO EN BD
    try {
      const [existingEmail]: any = await promisePool.execute(
        'SELECT person_id FROM Person WHERE email = ?',
        [email]
      );

      

      if (existingEmail.length > 0) {
        console.log(`❌ Email ya registrado: ${email}`);
        return res.status(400).json({ 
          status: "error",
          message: "Este correo electrónico ya está registrado" 
        });
      }
    } catch (dbError) {
      console.error("❌ Error consultando email duplicado:", dbError);
      return res.status(500).json({ 
        status: "error",
        message: "Error verificando email duplicado" 
      });
    }

    // 🔍 VALIDACIÓN 4: ROL ÚNICO (si aplica)
    if (UNIQUE_ROLES.includes(role_id)) {
      try {
        const [existingUsers]: any = await promisePool.execute(
          'SELECT person_id, name_person, email, role_id FROM Person WHERE role_id = ?',
          [role_id]
        );

        if (existingUsers.length > 0) {
          const getRoleName = (roleId: number): string => {
            const roles: { [key: number]: string } = {
              1: "Administrador",
              2: "Super Administrador", 
              3: "Usuario"
            };
            return roles[roleId] || "Rol desconocido";
          };

          console.log(`❌ Ya existe un usuario con role_id ${role_id}:`, existingUsers[0]);
          return res.status(400).json({ 
            status: "error",
            message: `Ya existe un ${getRoleName(role_id)} registrado en el sistema.`,
            conflictDetails: {
              existingUser: existingUsers[0].name_person,
              role: getRoleName(role_id)
            }
          });
        }
      } catch (dbError) {
        console.error("❌ Error consultando usuarios con mismo rol:", dbError);
        return res.status(500).json({ 
          status: "error",
          message: "Error verificando usuarios existentes" 
        });
      }
    }

    // 🔍 VALIDACIÓN 5: VERIFICAR ENTREGA DE EMAIL (OPCIONAL - MUY RECOMENDADO)
    console.log(`🔍 Verificando capacidad de entrega del email: ${email}`);
    const emailValidation = await validateEmailDelivery(email);
    
    if (!emailValidation.isValid) {
      console.log(`❌ Email inválido: ${emailValidation.reason}`);
      return res.status(400).json({ 
        status: "error",
        message: emailValidation.reason || "El correo electrónico no es válido"
      });
    }

    if (!emailValidation.canReceive) {
      console.log(`⚠️ Email puede no recibir mensajes: ${emailValidation.reason}`);
      // Decidir si esto debe ser un error o advertencia
      return res.status(400).json({ 
        status: "error",
        message: "El correo electrónico no puede recibir mensajes. Verifica que sea correcto."
      });
    }

    // ✅ PROCEDER CON EL REGISTRO
    console.log(`✅ Todas las validaciones pasaron. Registrando usuario...`);
    const user = new User(name_person, last_name, email, phone, password, role_id);
    await UserService.register(user);

    // 📧 ENVIAR EMAIL DE BIENVENIDA (YA VALIDADO)
    try {
      const emailResult = await sendWelcomeEmail(email, name_person);
      
      if (emailResult.sent) {
        console.log(`✅ Email de bienvenida enviado a: ${email}`);
      } else {
        console.error(`⚠️ Error enviando email: ${emailResult.message}`);
        // No fallar el registro, pero informar
      }
    } catch (emailError) {
      console.error("⚠️ Error enviando email de bienvenida:", emailError);
    }

    console.log(`✅ Usuario registrado exitosamente - Email: ${email}, Rol: ${role_id}`);
    return res.status(201).json({ 
      status: "success",
      message: "Usuario registrado exitosamente. Revisa tu correo para más información.",
      emailValidation: {
        valid: emailValidation.isValid,
        canReceive: emailValidation.canReceive
      }
    });

  } catch (error: any) {
    console.error("❌ Error al registrar usuario:", error);

    // Manejar error de email duplicado de la base de datos
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ 
        status: "error",
        message: "Este correo ya está registrado" 
      });
    }

    return res.status(500).json({ 
      status: "error",
      message: "Error en el servidor al registrar usuario"
    });
  }
};

export default register;