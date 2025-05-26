import { AdminRegisterDto } from '../Dto/AdminDto';
import * as adminRepository from '../repositories/AdminRepository';
import bcrypt from 'bcrypt';
import { sendAdminRegisterMail } from '../utils/mailer';

export const registerAdmin = async (adminData: AdminRegisterDto) => {
  const idRolAdmin = 1;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

  const adminConPasswordHash = {
    ...adminData,
    password: hashedPassword,
    role_id: idRolAdmin
  };

  const result = await adminRepository.insertAdmin(adminConPasswordHash);

  // ✅ Enviar correo de notificación
  await sendAdminRegisterMail(adminData.email, adminData.first_name);
  
  return result;
};

export const eliminarAdmin = async (correo: string) => {
  const result = await adminRepository.deleteAdmin(correo);
  return (result as any).affectedRows > 0;
};
