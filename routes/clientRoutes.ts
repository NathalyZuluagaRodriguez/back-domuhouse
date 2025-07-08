import { Router } from "express";
import { getAllClients, getTotalClients } from "../controllers/clientController";
import { sendEmail, saveMessage } from "../controllers/messageController"

const router = Router();

// Clientes
router.get("/clients", getAllClients);
router.get("/clients/count", getTotalClients);


// Mensajes
router.post("/messages/send",  sendEmail)   // envía correo + guarda
router.post("/messages/save",  saveMessage) // guarda sin enviar



export default router;
    