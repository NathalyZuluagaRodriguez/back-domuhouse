// // src/middlewares/isAdmin.ts
// import { Request, Response, NextFunction } from 'express';

// export const isAdmin = (req: Request & { user?: { id_rol: number } }, res: Response, next: NextFunction) => {
//   if (!req.user || req.user.id_rol !== 2) {
//     return res.status(403).json({
//       success: false,
//       message: 'Acceso denegado.'
//     });
//   }
//   next();
// };