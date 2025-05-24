import jwt from 'jsonwebtoken';

export const generateInvitationToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' }); // token válido por 7 días
};
