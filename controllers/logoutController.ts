import { Request, Response } from 'express';

export const logout = (req: Request, res: Response) => {
  // Aquí no hay invalidación real del token. Solo avisamos al cliente que lo borre.
  return res.status(200).json({ mensaje: 'Sesión cerrada exitosamente. Por favor, elimina el token del lado del cliente.' });
};