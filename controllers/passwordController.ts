import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../config/config-db'; // conexión a MySQL
import { transporter } from '../utils/mailerContraseña'; // nodemailer configurado

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';

// 🟢 1. Enviar correo de recuperación
export const enviarCorreoRecuperacion = async (req: Request, res: Response) => {
  const { correo } = req.body;

  try {
    const [rows]: any = await db.query('SELECT * FROM Persona WHERE correo = ?', [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Correo no registrado' });
    }

    const token = jwt.sign({ correo }, JWT_SECRET, { expiresIn: '15m' });
    const url = `${process.env.FRONTEND_URL}/recuperar-password/${token}`;

    const mailOptions = {
      from: `"DomuHouse Soporte" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `
        <h3>Solicitud de recuperación de contraseña</h3>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${url}" target="_blank">${url}</a>
        <p>Este enlace expirará en 15 minutos.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Correo de recuperación enviado correctamente' });

  } catch (error: any) {
    return res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
};

// 🟢 2. Cambiar contraseña con token
export const cambiarPassword = async (req: Request, res: Response) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const correo = decoded.correo;

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // Asegúrate que sea la tabla correcta donde se guarda el usuario (aquí usamos Persona)
    await db.query('UPDATE Persona SET password = ? WHERE correo = ?', [hashedPassword, correo]);

    return res.status(200).json({ message: '✅ Contraseña actualizada correctamente' });

  } catch (error: any) {
    return res.status(400).json({ message: '❌ Token inválido o expirado', error: error.message });
  }
};
