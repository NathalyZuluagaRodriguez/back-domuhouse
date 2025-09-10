import jwt from 'jsonwebtoken';

const generateToken = (properties: any, minutes: number) => {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT secret key is not defined in the .env file");
  }

  return jwt.sign(
    {
      ...properties, // all properties are placed at the root level of the token
      exp: Math.floor(Date.now() / 1000) + minutes * 60,
    },
    secretKey
  );
};

export default generateToken;
