import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo Gmail
    pass: process.env.EMAIL_PASS  // Contraseña o App Password
  }
});

export const sendAdminRegisterMail = async (destinatario: string, nombre: string) => {
  const mailOptions = {
    from: `"DomuHouse 👋" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Registro exitoso en DomuHouse',
    text: `Hola ${nombre}, tu cuenta de administrador ha sido registrada exitosamente en DomuHouse. 🎉`,
    html: `<p>Hola <strong>${nombre}</strong>,</p><p>Tu cuenta de <b>administrador</b> ha sido registrada correctamente en <b>DomuHouse</b>. 🎉</p><p>Gracias por formar parte de nuestra plataforma.</p>`
  };

  await transporter.sendMail(mailOptions);
};
