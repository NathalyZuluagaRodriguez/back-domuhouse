import jwt from 'jsonwebtoken';

let generateToken = (properties: any, minutes: number) => {
    const secretKey = process.env.KEY_TOKEN; 
    
    if (!secretKey) {
        throw new Error("La clave secreta JWT no está definida en el archivo .env");
    }

    return jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (minutes * 60),
        data: properties
    }, secretKey);
};

export default generateToken;




