import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  role_id: number;
  name_person?: string;
  email?: string;
}

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Token no proporcionado o malformado' 
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as DecodedToken;
    console.log("🔐 Token decodificado:", decoded);


    // Agregamos el usuario al request
    req.user = {
      person_id: decoded.id,
      role_id: decoded.role_id,
      name_person: decoded.name_person || "",
      email: decoded.email || ""
    };

    // Solo permites admins si lo deseas
    if (decoded.role_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};
