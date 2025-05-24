// repositories/invitacionRepository.ts
import db from '../config/config-db';

export const guardarTokenInvitacion = async (token: string, correo: string) => {
  const query = 'INSERT INTO TokenInvitacion (token, correo_destino) VALUES (?, ?)';
  await db.execute(query, [token, correo]);
};
