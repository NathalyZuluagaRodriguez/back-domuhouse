// repositories/invitacionRepository.ts
import db from '../config/config-db';

export const saveInvitationToken = async (token: string, recipient_email: string, id_real_estate : string) => {
  const query = 'INSERT INTO invitationtoken (token, recipient_email, id_real_estate) VALUES (?, ?, ?)';
  await db.execute(query, [token, recipient_email,id_real_estate]);
};
