import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  role_id: number;
  name_person?: string;
  email?: string;
}

// Middleware para validar el token sin filtrar por rol
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

    req.user = {
      person_id: decoded.id,
      role_id: decoded.role_id,
      name_person: decoded.name_person || '',
      email: decoded.email || ''
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};
