// repositories/passwordResetRepository.ts
import db from '../config/config-db';

export const guardarTokenReset = async (correo: string, token: string) => {
  const query = 'INSERT INTO PasswordReset (correo, token) VALUES (?, ?)';
  await db.execute(query, [correo, token]);
};

export const obtenerTokenReset = async (token: string) => {
  const [result] = await db.execute('SELECT * FROM PasswordReset WHERE token = ? AND usado = FALSE', [token]);
  return (result as any[])[0];
};

export const marcarTokenComoUsado = async (token: string) => {
  await db.execute('UPDATE PasswordReset SET usado = TRUE WHERE token = ?', [token]);
};
