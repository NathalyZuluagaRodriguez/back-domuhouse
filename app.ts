import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import login from './routes/login';
import rolesRoutes from './routes/roles';
import searchRoutes from './routes/searchProperty';
import agendaRoutes from './routes/Agenda';
import iaRoute from './routes/iaRoutes';
import adminRoutes from './routes/adminRoutes';
import invitacionRoutes from './routes/invitacionRoutes';
import passwordRoutes from './routes/passwordRoutes';
import registroRoutes from './routes/confirmacionRoutes';
// import agentRoutes from "./routes/agentRoutes";
// import  propertyRoutes  from './routes/agentRoutes'
// import  ventasAlquileresRoute  from './routes/agentRoutes'
// import reporteRoutes from './routes/agentRoutes';
import reportesRoute from './routes/reportesPropRoutes';
import busquedaRoutes from './routes/searchProperty'; 
import register from './routes/register';
import propertiesRoutes  from './routes/propertiesRoutes';
// import authRoutes from './routes/authRoutes';
import realEstateRoutes from './routes/realEstateRoutes';
import logout from './routes/logout';


// 🔧 Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔧 Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛠️ Middleware de debug para todas las peticiones
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  next();
});


// import busquedaRoutes from './routes/searchProperty'; // Repetida pero mantenida por si alguna usa prefijo distinto

// ✅ Prefijo consistente para rutas API
app.use('/api/properties', propertiesRoutes);
app.use('/api/inmobiliarias', realEstateRoutes);   // ← Aquí montamos las rutas de inmobiliarias
app.use('/api/admin', adminRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/password', passwordRoutes);
// app.use('/api/auth', authRoutes);

// app.use("/api", agentRoutes);
// app.use("/api", propertyRoutes); 
// app.use("/api", ventasAlquileresRoute);
// app.use(reporteRoutes);
// app.use('/api/reportes', reportesRoute);
app.use('/register',register);
// app.use('/auth', authRoutes);
app.use('/logout', logout);

// 🔐 Autenticación y registro
app.use('/login', login); 

// 🔍 Otras rutas sin prefijo
// app.use('/roles', rolesRoutes);
app.use('/agenda', agendaRoutes);
app.use('/ia', iaRoute);
app.use('/api/search', searchRoutes);

// ✅ Ruta base de salud
app.get('/', (_req, res) => {
  res.json({
    message: 'DomuHouse API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'online',
    iaIntegration: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
  });
});

// 🔍 Ruta de prueba
app.get('/test', (_req, res) => {
  res.json({ message: 'Server is working!' });
});

// ⚠️ Verificación de claves importantes
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ ADVERTENCIA: No se ha definido GEMINI_API_KEY en las variables de entorno');
  console.warn('Las funcionalidades de IA no funcionarán correctamente');
}

// ❌ Rutas no encontradas
app.use('*', (req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
  });
});

// ❌ Manejo global de errores
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error global:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}`);
  console.log(`🏠 Properties Endpoint: http://localhost:${PORT}/api/properties`);
  console.log(`🏠 Real Estate Endpoint: http://localhost:${PORT}/api/inmobiliarias`); // Confirmamos el endpoint aquí
  console.log(`🤖 IA Endpoint: http://localhost:${PORT}/ia`);
});

export default app;