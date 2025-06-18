import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configuración del transportador de correos con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Correo del remitente (definido en .env)
    pass: process.env.EMAIL_PASS  // Contraseña o App Password generada en Gmail
  }
});

/**
 * Envía un correo de confirmación de registro al nuevo administrador.
 *
 * @param destinatario - Correo electrónico del administrador
 * @param nombre - Nombre del administrador
 */
export const sendAdminRegisterMail = async (destinatario: string, nombre: string) => {
  const mailOptions = {
    from: `"DomuHouse 👋" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Registro exitoso en DomuHouse',
    text: `Hola ${nombre}, tu cuenta de administrador ha sido registrada exitosamente en DomuHouse. 🎉`,
    html: `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu cuenta de <b>administrador</b> ha sido registrada correctamente en <b>DomuHouse</b>. 🎉</p>
      <p>Gracias por formar parte de nuestra plataforma.</p>
    `
  };

  // Enviar el correo
  await transporter.sendMail(mailOptions);
};
