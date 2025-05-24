import { Request, Response } from "express";
import nodemailer from "nodemailer";

export const validarCorreo = async (req: Request, res: Response) => {
  const { nombre, apellido, telefono, correo, password } = req.body;

  if (!correo) {
    return res.status(400).json({ msg: "El correo es obligatorio" });
  }

  // Código de verificación
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Configurar el transporte (usa tu propio email real)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tu_correo@gmail.com",
        pass: "tu_contraseña_de_app"
      }
    });

    // Enviar el correo
    await transporter.sendMail({
      from: '"Tu Proyecto" <tu_correo@gmail.com>',
      to: correo,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${codigo}`,
      html: `<b>Tu código de verificación es: ${codigo}</b>`
    });

    return res.status(200).json({
      msg: "Correo enviado con éxito",
      codigo
    });

  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return res.status(500).json({ msg: "Error al enviar el correo" });
  }
};
