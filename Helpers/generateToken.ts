import jwt from 'jsonwebtoken';

let generateToken = (properties: any, minutes: number) => {
    const secretKey = process.env.JWT_SECRET; 
    
    if (!secretKey) {
        throw new Error("La clave secreta JWT no está definida en el archivo .env");
    }

    return jwt.sign( {
    ...properties, // así todos los datos quedan al nivel raíz
    exp: Math.floor(Date.now() / 1000) + minutes * 60,
  },
  secretKey);
};

export default generateToken;




