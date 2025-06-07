// import { Request, Response } from 'express';
// import { validateEmailFormat } from '../utils/validateEmail';
// import promisePool from '../config/config-db';
// import {transporter,  MAIL_FROM } from "../config/config-mailers";
// import generateToken from '../Helpers/generateToken';
// import generateHash from '../Helpers/generateHash';
// import usuarioRepo from '../repositories/UserRepository';
// import jwt from 'jsonwebtoken';


// export const validateEmail = async (req: Request, res: Response) => {
//   const { email } = req.body;

//   if (!email || typeof email !== 'string') {
//     return res.status(400).json({ error: 'Correo es requerido' });
//   }

//   if (!validateEmailFormat(email)) {
//     return res.status(400).json({ error: 'Formato de correo inválido' });
//   }

//   try {
//     const [rows]: any = await promisePool.query('CALL sp_check_email(?)', [email]);
//     if (rows[0].length > 0) {
//       return res.status(409).json({ error: 'El correo ya está registrado' });
//     }

//     const codigo = Math.floor(100000 + Math.random() * 900000).toString();

//     await promisePool.query('CALL sp_save_verification_code(?, ?)', [email, codigo]);

//     await transporter.sendMail({
//       from: MAIL_FROM,
//       to: email,
//       subject: 'Código de verificación',
//       text: `Tu código de verificación es: ${codigo}`
//     });

//     return res.json({ mensaje: 'Código enviado al correo' });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };

// export const verifycode = async (req: Request, res: Response) => {
//   const { email, codigo } = req.body;

//   if (!email || !codigo) {
//     return res.status(400).json({ error: 'Correo y código son requeridos' });
//   }

//   try {
//     const [rows]: any = await promisePool.query('CALL sp_verify_code(?, ?)', [email, codigo]);
//     const valido = rows[0].length > 0;

//     if (!valido) {
//       return res.status(400).json({ error: 'Código inválido o expirado' });
//     }

//     return res.json({ mensaje: 'Código verificado correctamente' });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };


// export const recoverPassword = async (req: Request, res: Response) => {
//   const { correo } = req.body;

//   if (!correo || typeof correo !== 'string') {
//     return res.status(400).json({ error: 'Correo es requerido' });
//   }

//   try {
//     const [rows]: any = await promisePool.query('CALL sp_check_email(?)', [correo]);

//     if (rows[0].length === 0) {
//       return res.status(404).json({ error: 'El correo no está registrado' });
//     }

//     const token = generateToken({ correo }, 15); // Token válido por 15 minutos

    const recoveryUrl = `https://domuhouse-express.onrender.com/auth/restablecer-contrasena?token=${token}`;

//     await transporter.sendMail({
//       from: MAIL_FROM,
//       to: correo,
//       subject: 'Recuperación de contraseña',
//       text: `Haz clic en este enlace para restablecer tu contraseña: ${recoveryUrl}`
//     });

//     return res.json({ mensaje: 'Correo de recuperación enviado.' });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Error interno del servidor' });
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   const { token, nuevaContrasena } = req.body;

//   if (!token || !nuevaContrasena) {
//     return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.KEY_TOKEN as string);
//     const correo = decoded.data.correo;

//     const hashedPassword = await generateHash(nuevaContrasena);
//     await usuarioRepo.updatePassword(correo, hashedPassword);

//     return res.json({ mensaje: 'Contraseña restablecida correctamente' });

//   } catch (error) {
//     console.error(error);
//     return res.status(401).json({ error: 'Token inválido o expirado' });
//   }
// };

// export const confirmRegistration = async (req: Request, res: Response) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ error: 'Token requerido' });
//   }

//   try {
//     const secretKey = process.env.KEY_TOKEN;
//     if (!secretKey) {
//       throw new Error('KEY_TOKEN no está definida');
//     }
//     return res.json({ mensaje: 'Token válido'});
//   } catch (error) {
//     console.error(error);
//     return res.status(401).json({ error: 'Token inválido o expirado' });
//   }
// };