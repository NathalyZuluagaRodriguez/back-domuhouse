
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../config/config-db'; // conexión a MySQL
import { transporter } from '../utils/mailerContraseña'; // nodemailer configurado

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';

// 🟢 1. Enviar correo de recuperación
export const SendRecoveryMail = async (req: Request, res: Response) => {
  const { correo } = req.body;

  try {
    const [rows]: any = await db.query('SELECT * FROM Person WHERE email = ?', [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Correo no registrado' });
    }

    const token = jwt.sign({ correo }, JWT_SECRET, { expiresIn: '15m' });

    const mailOptions = {
      from: `"DomuHouse Soporte" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recuperación de contraseña - DomuHouse',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef;">
              <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">
                🏠 DomuHouse
              </h1>
              <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">
                Plataforma de Gestión Inmobiliaria
              </p>
            </div>

            <!-- Título principal -->
            <h2 style="color: #007bff; text-align: center; margin: 0 0 25px 0; font-size: 24px; font-weight: 500;">
              🔐 Código de Recuperación
            </h2>

            <!-- Contenido principal -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
              </p>
              
              <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0;">
                Copia el código completo que aparece abajo y pégalo en la aplicación:
              </p>
            </div>

            <!-- Código de verificación -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #495057; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                Tu código de verificación:
              </p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #007bff; margin: 10px 0;">
                <p style="color: #007bff; font-size: 14px; font-weight: 600; margin: 0; font-family: monospace; word-break: break-all; line-height: 1.4;">
                  ${token}
                </p>
              </div>
              <p style="color: #6c757d; font-size: 14px; margin: 10px 0 0 0; font-style: italic;">
                Selecciona todo el código y cópialo completo
              </p>
            </div>

            <!-- Instrucciones -->
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p style="color: #1565c0; font-size: 14px; margin: 0; font-weight: 500;">
                📝 Instrucciones:
              </p>
              <ol style="color: #1565c0; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Copia el código completo de arriba</li>
                <li>Ve a la aplicación DomuHouse</li>
                <li>Pega el código en el campo "Código de Verificación"</li>
                <li>Ingresa tu nueva contraseña</li>
              </ol>
            </div>

            <!-- Advertencia de tiempo -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
                ⏰ <strong>Importante:</strong> Este código expirará en 15 minutos por seguridad.
              </p>
            </div>

            <!-- Nota de seguridad -->
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6c757d; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
                <strong>Nota de seguridad:</strong> Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual permanecerá sin cambios.
              </p>
              
              <p style="color: #6c757d; font-size: 13px; line-height: 1.5; margin: 0;">
                Si tienes problemas, contacta a nuestro equipo de soporte respondiendo a este correo.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                © 2025 DomuHouse. Todos los derechos reservados.
              </p>
            </div>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      message: 'Correo de recuperación enviado correctamente',
      info: 'Revisa tu bandeja de entrada y copia el código completo'
    });

  } catch (error: any) {
    console.error('Error al enviar correo:', error);
    return res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
};

// 🟢 2. Cambiar contraseña con token
export const changePassword = async (req: Request, res: Response) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
  }

  try {
    // Verificar y decodificar el token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const correo = decoded.correo;

    // Verificar que el usuario existe
    const [rows]: any = await db.query('SELECT * FROM Person WHERE email = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // Actualizar la contraseña en la base de datos
    await db.query('UPDATE Person SET password = ? WHERE email = ?', [hashedPassword, correo]);

    console.log(`✅ Contraseña actualizada para: ${correo}`);

    return res.status(200).json({ 
      message: '✅ Contraseña actualizada correctamente',
      info: 'Ya puedes iniciar sesión con tu nueva contraseña'
    });

  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: '❌ El código ha expirado. Solicita uno nuevo.' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: '❌ Código inválido. Verifica que lo hayas copiado completo.' });
    }

    return res.status(500).json({ message: '❌ Error interno del servidor', error: error.message });
  }
};