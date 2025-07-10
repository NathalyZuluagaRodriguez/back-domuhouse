import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
// 📁 Importar todas las rutas
import "express-session";
import login from './routes/login';
import rolesRoutes from './routes/roles';
import searchRoutes from './routes/searchProperty';
import agendaRoutes from './routes/Agenda';
import iaRoute from './routes/iaRoutes';
import adminRoutes from './routes/adminRoutes';
import invitacionRoutes from './routes/invitacionRoutes';
import passwordRoutes from './routes/passwordRoutes';
import registroRoutes from './routes/confirmacionRoutes';
import reportesRoute from './routes/reportesPropRoutes';
import agentRoutes from "./routes/agentRoutes";
import register from './routes/register';
import propertiesRoutes from './routes/propertiesRoutes';
import realEstateRoutes from './routes/realEstateRoutes';
import logout from './routes/logout';
import userRoutes from './routes/userRoutes' // ajusta la ruta si está en otra carpeta
import summaryRoutes from './routes/summaryRoutes';
import realEstateAdminRoutes from './routes/realEstateAdmin';
import propertiesAdminRoutes from './routes/propertiesAdminRoutes';
import clientRoutes from "./routes/clientRoutes";
import interestRoutes from "./routes/interestRoutes"
import visitRoutes from './routes/visits.js';
import contractsRoutes from './routes/contractsRoutes';


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

// ✅ RUTAS API CON PREFIJOS ORGANIZADOS
app.use('/api', summaryRoutes);
app.use('/api', realEstateAdminRoutes);
app.use('/api', propertiesAdminRoutes); // Las rutas estarán disponibles bajo /api/...
app.use('/api', visitRoutes);


app.use('/api', userRoutes)
  
// 🏠 Rutas de propiedades
app.use('/api/properties', propertiesRoutes);
app.use('/api/inmobiliarias', realEstateRoutes);

// 🔍 CORREGIR LAS RUTAS DE BÚSQUEDA
app.use('/api/search', searchRoutes);  // Cambiar a /api/search

// 🔐 Rutas de autenticación
app.use('/login', login);
app.use('/register', register);
app.use('/logout', logout);

// 👥 Rutas de administración
app.use('/api/admin', adminRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/registro', registroRoutes);
// app.use('/api/auth', authRoutes);


// Rutas de Agente
app.use("/api", agentRoutes);
app.use('/api/invitacion', invitacionRoutes);
// app.use("/api", propertyRoutes); 
// app.use("/api", ventasAlquileresRoute);
// app.use(reporteRoutes);
// app.use('/api/reportes', reportesRoute);

// Rutas Cliente
app.use("/api", clientRoutes);

// Rutas Interes
app.use("/api", interestRoutes)


app.use('/register',register);
// app.use('/auth', authRoutes);
app.use('/logout', logout);

// 🔐 Autenticación y registro
app.use('/login', login); 

// 🔍 Otras rutas sin prefijo
// app.use('/roles', rolesRoutes);
app.use('/agenda', agendaRoutes);
app.use('/ia', iaRoute);
app.use('/api/contracts', contractsRoutes);

app.get('/mi-inmobiliaria/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    console.log('Buscando archivo en:', filePath);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      console.log('Archivo no encontrado:', filePath);
      res.status(404).send('Archivo no encontrado');
    }
  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    res.status(500).send('Error del servidor');
  }
});

// ✅ Ruta base de salud
app.get('/', (_req, res) => {
  res.json({
    message: 'DomuHouse API funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'online',
    iaIntegration: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    endpoints: {
      properties: '/api/properties',
      realEstate: '/api/inmobiliarias',
      search: '/api/search/search',
      filterByOperation: '/api/search/filter/{Venta|Arriendo}',
      quickFilter: '/api/search/quick-filter',
      allByOperation: '/api/search/all-by-operation'
    }
  });
});

// 🔍 Ruta de prueba
app.get('/test', (_req, res) => {
  res.json({ 
    message: 'Server is working!',
    availableEndpoints: [
      'GET /api/search/search - Búsqueda completa con filtros',
      'GET /api/search/filter/Venta - Filtrar solo propiedades en venta',
      'GET /api/search/filter/Arriendo - Filtrar solo propiedades en arriendo',
      'POST /api/search/quick-filter - Filtrado rápido por operación',
      'GET /api/search/all-by-operation - Todas las propiedades separadas por operación'
    ]
  });
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
    availableRoutes: [
      '/api/search/search',
      '/api/search/filter/Venta',
      '/api/search/filter/Arriendo',
      '/api/search/quick-filter',
      '/api/search/all-by-operation'
    ]
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
  console.log(`🏠 Real Estate Endpoint: http://localhost:${PORT}/api/inmobiliarias`);
  console.log(`🔍 Search Endpoint: http://localhost:${PORT}/api/search/search`);
  console.log(`🔍 Filter Venta: http://localhost:${PORT}/api/search/filter/Venta`);
  console.log(`🔍 Filter Arriendo: http://localhost:${PORT}/api/search/filter/Arriendo`);
  console.log(`🤖 IA Endpoint: http://localhost:${PORT}/ia`);
});

export default app;
