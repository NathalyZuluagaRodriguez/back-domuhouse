export interface Persona {
    id_persona?: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    password: string;
    id_rol: number;
    verificado?: boolean;
  }