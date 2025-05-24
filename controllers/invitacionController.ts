// controllers/invitacionController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { guardarTokenInvitacion } from '../repositories/invitacionRepository';
import { sendInvitationEmail } from '../utils/sendEmailer';


export const generarInvitacion = async (req: Request, res: Response) => {
  const { correo } = req.body;

  try {
    const token = jwt.sign({ correo }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    // Guardar en la base de datos
    await guardarTokenInvitacion(token, correo);
    await sendInvitationEmail(correo, token);


    return res.status(200).json({
      message: 'Token de invitación generado y guardado correctamente',
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al generar el token',
      error: (error as Error).message,
    });
  }
};
