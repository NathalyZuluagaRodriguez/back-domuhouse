import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
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
import authRoutes from './routes/authRoutes';
import realEstateRoutes from './routes/realEstateRoutes';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/login',login);
app.use('/roles', rolesRoutes);
app.use('/', searchRoutes);
app.use('/agenda', agendaRoutes);
app.use('/ia', iaRoute);
app.use("/api", adminRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/registro', registroRoutes);
app.use('/api/admin', adminRoutes);
// app.use("/api", agentRoutes);
// app.use("/api", propertyRoutes); 
// app.use("/api", ventasAlquileresRoute);
// app.use(reporteRoutes);
// app.use('/api/reportes', reportesRoute);
app.use('/busqueda', busquedaRoutes);
app.use('/register',register);
app.use('/api/propiedades', propiedadesRoutes)
app.use('/auth', authRoutes);
app.use('/api/inmobiliarias', realEstateRoutes);



// Verificar API key
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ ADVERTENCIA: No se ha definido GEMINI_API_KEY en las variables de entorno');
    console.warn('Las funcionalidades de IA no funcionarán correctamente');
  }


// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Ruta para verificar el estado de la API
app.get('/status', (_req, res) => {
    res.json({
      status: 'online',
      iaIntegration: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      timestamp: new Date().toISOString()
    });
  });



  
const PORT = process.env.PORT || 10101;



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API de IA inmobiliaria activa en http://localhost:${PORT}/ia`);

});
