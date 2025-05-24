// controllers/validarCorreo.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import promisePool from "../config/config-db";

const generarCodigo = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
};

const validarCorreo = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "El correo es obligatorio." });
  }

  const codigo = generarCodigo();

  try {
    // Guardar código en la base de datos
    await promisePool.query("CALL sp_guardar_codigo_verificacion(?, ?)", [email, codigo]);

    // Configurar transporte de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tucorreo@gmail.com",        // ← pon tu correo real
        pass: "tu-contraseña-o-app-pass",   // ← pon tu contraseña o app password
      },
    });

    // Enviar correo con el código
    await transporter.sendMail({
      from: "Validación Inmobiliaria <tucorreo@gmail.com>",
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${codigo}`,
    });

    return res.status(200).json({ message: "Código enviado correctamente" });

  } catch (error) {
    console.error("❌ Error enviando código:", error);
    return res.status(500).json({ error: "Error al enviar el correo" });
  }
};

export default validarCorreo;
