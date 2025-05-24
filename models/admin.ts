export interface Persona {
    id_persona?: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    password: string;
    id_rol: number;
  }
  
  export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
  }
  