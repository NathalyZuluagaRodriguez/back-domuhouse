import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import multer from 'multer';

// Importar rutas
import login from './routes/login';
import rolesRoutes from './routes/roles';
import searchRoutes from './routes/searchProperty';
import agendaRoutes from './routes/Agenda';
import iaRoute from './routes/iaRoutes';
import adminRoutes from './routes/adminRoutes';
import invitacionRoutes from './routes/invitacionRoutes';
import passwordRoutes from './routes/passwordRoutes';
import registroRoutes from './routes/confirmacionRoutes';
import busquedaRoutes from './routes/searchProperty'; 
import register from './routes/register';
import propertiesRoutes from './routes/propertiesRoutes';
import authRoutes from './routes/authRoutes';
import realEstateRoutes from './routes/realEstateRoutes';

// Configurar dotenv ANTES de usar variables de entorno
dotenv.config();

const app = express();

// MIDDLEWARE GLOBAL - DEBE IR PRIMERO
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging - ayuda a debuggear
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    console.log('Params:', req.params);
    next();
});

// RUTAS - Orden importa, las más específicas primero
app.use('/register', register);
app.use('/login', login);
app.use('/auth', authRoutes);

// Rutas de API - usar prefijo consistente
app.use('/api/properties', propertiesRoutes);
app.use('/api/inmobiliarias', realEstateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/registro', registroRoutes);

// Otras rutas
app.use('/roles', rolesRoutes);
app.use('/agenda', agendaRoutes);
app.use('/ia', iaRoute);
app.use('/busqueda', busquedaRoutes);
app.use('/search', searchRoutes); // Evitar duplicados

// Ruta para verificar el estado de la API
app.get('/status', (_req, res) => {
    res.json({
        status: 'online',
        iaIntegration: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba para debug
app.get('/test', (_req, res) => {
    res.json({ message: 'Server is working!' });
});

// Middleware de manejo de errores - DEBE IR AL FINAL
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        path: req.path 
    });
});

// Middleware para rutas no encontradas - DEBE IR AL FINAL
app.use('*', (req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        path: req.originalUrl
    });
});

// Verificar API key
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ ADVERTENCIA: No se ha definido GEMINI_API_KEY en las variables de entorno');
    console.warn('Las funcionalidades de IA no funcionarán correctamente');
}

const PORT = process.env.PORT || 10101;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 API disponible en http://localhost:${PORT}`);
    console.log(`🤖 API de IA inmobiliaria activa en http://localhost:${PORT}/ia`);
    console.log(`✅ Rutas registradas:`);
    console.log(`   - GET  /test`);
    console.log(`   - GET  /status`);
    console.log(`   - POST /register`);
    console.log(`   - POST /login`);
    console.log(`   - PUT  /api/properties/aprobar/:id`);
    console.log(`   - GET  /api/properties/`);
});