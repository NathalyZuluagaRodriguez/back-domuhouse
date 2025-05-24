import { Request, Response } from 'express';
import pool from '../config/config-db';
import nodemailer from 'nodemailer';

export const confirmarRegistro = async (req: Request, res: Response) => {
  const { correo } = req.params;

  try {
    // Activar cuenta
    const [result] = await pool.query('UPDATE Persona SET activo = true WHERE correo = ?', [correo]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Correo no encontrado o ya activado.' });
    }

    // Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: '¡Cuenta Activada!',
      text: '¡Tu cuenta ha sido activada exitosamente! Ya puedes iniciar sesión en DomuHouse.'
    });

    res.json({ message: '¡Registro completo! Tu cuenta ha sido activada y se ha enviado un correo de confirmación.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al confirmar el registro.', error });
  }
};
