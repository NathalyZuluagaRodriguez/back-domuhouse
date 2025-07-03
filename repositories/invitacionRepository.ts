import db from '../config/config-db';

export const saveInvitationToken = async (
  token: string,
  recipient_email: string,
  realEstateId: number
) => {
  const sql = ` INSERT INTO invitationtoken
      (token, recipient_email, id_real_estate)   
    VALUES (?, ?, ?);`
  
  
  await db.execute(sql, [token, recipient_email, realEstateId])
}

/* NUEVA FUNCIÓN */
export const getAllInvitationTokens = async () => {
  const sql = `  SELECT
      token_id,
      token,
      recipient_email,
      id_real_estate,
      used,
      created_at
    FROM invitationtoken
    ORDER BY created_at DESC;`
  
  
  const [rows] = await db.execute(sql)
  return rows as any[]
}