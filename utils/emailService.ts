import nodemailer from "nodemailer";
import { promisify } from 'util';
import * as dns from 'dns';

const dnsResolve = promisify(dns.resolveMx);

// 📧 CONFIGURACIÓN DEL TRANSPORTER
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔍 VALIDACIÓN BÁSICA DE FORMATO DE EMAIL
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// 🚫 LISTA DE DOMINIOS TEMPORALES/DESECHABLES COMUNES
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
  'mailinator.com', 'throwaway.email', 'temp-mail.org',
  'yopmail.com', 'maildrop.cc', 'fakeinbox.com', 'getnada.com',
  'sharklasers.com', 'guerrillamailblock.com'
];

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
};

// 🌐 VERIFICAR SI EL DOMINIO TIENE SERVIDOR DE EMAIL (MX Record)
export const domainHasMailServer = async (domain: string): Promise<boolean> => {
  try {
    const mxRecords = await dnsResolve(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.log(`❌ No se encontró servidor de email para dominio: ${domain}`);
    return false;
  }
};

// ✅ VALIDACIÓN AVANZADA DE EMAIL CON MÚLTIPLES MÉTODOS
export const validateEmailDelivery = async (email: string): Promise<{
  isValid: boolean;
  canReceive: boolean;
  reason?: string;
  validationMethod: string;
}> => {
  try {
    // 1. Validar formato
    if (!isValidEmailFormat(email)) {
      return {
        isValid: false,
        canReceive: false,
        reason: "Formato de email inválido",
        validationMethod: "format"
      };
    }

    // 2. Verificar si es email desechable
    if (isDisposableEmail(email)) {
      return {
        isValid: false,
        canReceive: false,
        reason: "No se permiten emails temporales o desechables",
        validationMethod: "disposable"
      };
    }

    const domain = email.split('@')[1];

    // 3. Verificar que el dominio tenga servidor de email
    const hasMxRecord = await domainHasMailServer(domain);
    if (!hasMxRecord) {
      return {
        isValid: false,
        canReceive: false,
        reason: `El dominio ${domain} no tiene servidor de email configurado`,
        validationMethod: "mx_record"
      };
    }

    // 4. Intentar verificación por SMTP (método más confiable pero más lento)
    try {
      await transporter.verify();
      
      // Crear un email de verificación muy ligero
      const testMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "✅ Verificación DomuHouse",
        text: "Verificación automática - No responder",
        html: `
          <div style="font-family: Arial; padding: 20px; text-align: center;">
            <h3>🔐 Verificación de Email</h3>
            <p>Tu email ha sido verificado exitosamente.</p>
            <p style="color: #666; font-size: 12px;">
              Este es un mensaje automático - No responder
            </p>
          </div>
        `
      };

      // Enviar con timeout corto
      const sendPromise = transporter.sendMail(testMailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000) // 10 segundos
      );

      await Promise.race([sendPromise, timeoutPromise]);
      
      console.log(`✅ Email verificado exitosamente: ${email}`);
      return {
        isValid: true,
        canReceive: true,
        reason: "Email válido y puede recibir mensajes",
        validationMethod: "smtp_test"
      };

    } catch (smtpError: any) {
      console.log(`❌ Error SMTP verificando ${email}:`, smtpError.message);
      
      // Analizar el tipo de error específico
      const errorMessage = smtpError.message?.toLowerCase() || '';
      const errorCode = smtpError.code;
      const responseCode = smtpError.responseCode;

      // Errores que indican email definitivamente inválido
      if (
        responseCode === 550 ||
        responseCode === 551 ||
        responseCode === 553 ||
        errorMessage.includes('user unknown') ||
        errorMessage.includes('recipient rejected') ||
        errorMessage.includes('address rejected') ||
        errorMessage.includes('no such user') ||
        errorMessage.includes('invalid recipient')
      ) {
        return {
          isValid: false,
          canReceive: false,
          reason: "El email no existe o fue rechazado por el servidor",
          validationMethod: "smtp_rejection"
        };
      }

      // Errores de conexión o temporales
      if (
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ECONNECTION' ||
        errorCode === 'ENOTFOUND' ||
        errorMessage.includes('timeout') ||
        responseCode === 421 ||
        responseCode === 450
      ) {
        console.log(`⚠️ Error temporal verificando ${email}, asumiendo válido`);
        return {
          isValid: true,
          canReceive: true, // Asumimos que puede recibir
          reason: "No se pudo verificar completamente pero el formato es válido",
          validationMethod: "timeout_assume_valid"
        };
      }

      // Error desconocido - ser conservador
      return {
        isValid: false,
        canReceive: false,
        reason: "No se pudo verificar el email: " + smtpError.message,
        validationMethod: "unknown_error"
      };
    }

  } catch (error: any) {
    console.error("❌ Error general validando email:", error);
    return {
      isValid: false,
      canReceive: false,
      reason: "Error interno verificando email",
      validationMethod: "system_error"
    };
  }
};

// 📨 VALIDACIÓN RÁPIDA (Sin envío de email de prueba)
export const validateEmailQuick = async (email: string): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  // 1. Formato
  if (!isValidEmailFormat(email)) {
    return { isValid: false, reason: "Formato inválido" };
  }

  // 2. Desechable
  if (isDisposableEmail(email)) {
    return { isValid: false, reason: "Email temporal no permitido" };
  }

  // 3. Dominio con MX record
  const domain = email.split('@')[1];
  const hasMxRecord = await domainHasMailServer(domain);
  if (!hasMxRecord) {
    return { isValid: false, reason: "Dominio sin servidor de email" };
  }

  return { isValid: true, reason: "Email válido (verificación rápida)" };
};

// 🎉 EMAIL DE BIENVENIDA CON VALIDACIÓN MEJORADA
export const sendWelcomeEmail = async (email: string, firstName: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🏠 DomuHouse</h1>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Tu plataforma inmobiliaria de confianza</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #3498db; font-size: 24px;">¡Bienvenido, ${firstName}! 🎉</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Tu cuenta ha sido creada exitosamente. Ya puedes disfrutar de todas las funcionalidades de DomuHouse.
          </p>
        </div>

        <!-- Características -->
        <div style="background: #f8f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
          <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
            <li>🔍 Buscar propiedades en tu zona preferida</li>
            <li>💰 Comparar precios y características</li>
            <li>📞 Contactar directamente con agentes</li>
            <li>❤️ Guardar tus propiedades favoritas</li>
            <li>📅 Agendar visitas fácilmente</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://domu-house.vercel.app/" 
             style="background: #3498db; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;
                    display: inline-block; font-size: 16px;">
            Iniciar Sesión Ahora
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #95a5a6; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} DomuHouse - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: `DomuHouse <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 ¡Bienvenido a DomuHouse!",
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return { sent: true, message: "Email enviado exitosamente" };
    
  } catch (error: any) {
    console.error("❌ Error enviando email de bienvenida:", error);
    return { sent: false, message: error.message };
  }
};

// 🚫 EMAIL DE USUARIO NO ENCONTRADO (NUEVA FUNCIÓN)
export const sendUserNotFoundEmail = async (email: string) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🏠 DomuHouse</h1>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Tu plataforma inmobiliaria de confianza</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #e74c3c; font-size: 24px;">🔐 Intento de Acceso Detectado</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hemos detectado un intento de acceso con este email <strong>${email}</strong>, 
            pero no encontramos una cuenta asociada.
          </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">¿Qué puedes hacer?</h3>
          <ul style="color: #856404; text-align: left; padding-left: 20px;">
            <li>Si ya tienes una cuenta, verifica que estés usando el email correcto</li>
            <li>Si no tienes cuenta, puedes registrarte usando el botón de abajo</li>
            <li>Si crees que esto es un error, contacta nuestro soporte</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://domu-house.vercel.app/register" 
             style="background: #27ae60; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;
                    display: inline-block; font-size: 16px; margin-right: 10px;">
            Crear Cuenta Nueva
          </a>
          <a href="https://domu-house.vercel.app/login" 
             style="background: #3498db; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;
                    display: inline-block; font-size: 16px;">
            Intentar de Nuevo
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #95a5a6; font-size: 12px; margin: 0;">
            Si no intentaste acceder a DomuHouse, puedes ignorar este mensaje.<br>
            © ${new Date().getFullYear()} DomuHouse - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: `DomuHouse Seguridad <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Intento de Acceso - Usuario No Encontrado",
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de usuario no encontrado enviado a: ${email}`);
    return { sent: true, message: "Email de usuario no encontrado enviado" };
    
  } catch (error: any) {
    console.error("❌ Error enviando email de usuario no encontrado:", error);
    return { sent: false, message: error.message };
  }
};

// 🔔 EMAIL DE NOTIFICACIÓN DE SEGURIDAD
export const sendSecurityNotificationEmail = async (email: string, details: {
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  location?: string;
}) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🏠 DomuHouse</h1>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Notificación de Seguridad</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #f39c12; font-size: 24px;">🔒 Intento de Acceso Sospechoso</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Detectamos un intento de acceso a tu cuenta desde una ubicación o dispositivo no reconocido.
          </p>
        </div>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #721c24; margin-top: 0;">Detalles del Intento:</h3>
          <div style="color: #721c24; text-align: left;">
            <p><strong>Fecha:</strong> ${details.timestamp?.toLocaleString() || 'No disponible'}</p>
            <p><strong>Dirección IP:</strong> ${details.ipAddress || 'No disponible'}</p>
            <p><strong>Ubicación:</strong> ${details.location || 'No disponible'}</p>
            <p><strong>Dispositivo:</strong> ${details.userAgent || 'No disponible'}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
            Si este intento fuiste tú, puedes ignorar este mensaje. 
            Si no reconoces esta actividad, te recomendamos cambiar tu contraseña inmediatamente.
          </p>
          <a href="https://domu-house.vercel.app/change-password" 
             style="background: #e74c3c; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;
                    display: inline-block; font-size: 16px;">
            Cambiar Contraseña
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #95a5a6; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} DomuHouse - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: `DomuHouse Seguridad <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔒 Alerta de Seguridad - Intento de Acceso Detectado",
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`🔔 Email de notificación de seguridad enviado a: ${email}`);
    return { sent: true, message: "Email de notificación de seguridad enviado" };
    
  } catch (error: any) {
    console.error("❌ Error enviando email de notificación de seguridad:", error);
    return { sent: false, message: error.message };
  }
};