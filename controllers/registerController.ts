import { Request, Response } from "express";
import User from "../Dto/UserDto";
import UserService from "../services/UserServices";

let register = async (req: Request, res: Response) => {
  try {
    // Aquí el mapeo correcto: usamos first_name que llega desde el frontend
    const { first_name, last_name, phone, email, password } = req.body;

    console.log("📩 Datos recibidos:", first_name, last_name, phone, email, password);

    // Creamos el objeto User correctamente
    const user = new User(first_name, last_name, email, phone, password, 3);

    // Llamamos el servicio (no es necesario guardar en variable)
    await UserService.register(user);

    console.log("✅ Usuario registrado con éxito");
    return res.status(201).json({ status: "register ok" });

  } catch (error: any) {
    console.error("❌ Error al registrar usuario:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(500).json({ errorInfo: error.sqlMessage });
    }

    return res.status(500).json({ error: "Error en el servidor" });
  }
};

export default register;
