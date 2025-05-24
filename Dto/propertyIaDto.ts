export interface PropertyIaDto {
    direccion: string;
    descripcion: string;
    precio: number;
    estado: 'Vendida' | 'Alquilada' | 'Disponible';
    id_persona: number;
    id_tipo_propiedad: number;
  }
  