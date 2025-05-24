import { Request, Response } from 'express';
import * as adminService from '../services/adminServices';
import { deleteAdmin } from '../repositories/AdminRepository';


export const eliminarAdmin = async (req: Request, res: Response) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ message: 'Correo es requerido' });
    }

    const resultado = await adminService.eliminarAdmin(correo);

    if (!resultado) {
      return res.status(404).json({ message: 'Admin no encontrado o ya eliminado' });
    }

    res.status(200).json({ message: 'Administrador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const nuevoAdmin = await adminService.registerAdmin(req.body);
    res.status(201).json({ message: 'Administrador registrado exitosamente', data: nuevoAdmin });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al registrar el administrador', error: error.message });
  }
};
