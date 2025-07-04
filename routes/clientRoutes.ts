import { Router } from "express";
import { getAllClients } from "../controllers/clientController";
import { sendEmail, saveMessage } from "../controllers/messageController"

const router = Router();

// Clientes
router.get("/clients", getAllClients);


// Mensajes
router.post("/messages/send",  sendEmail)   // envía correo + guarda
router.post("/messages/save",  saveMessage) // guarda sin enviar



export default router;
    