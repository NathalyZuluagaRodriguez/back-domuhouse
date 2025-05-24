export interface ICaracteristicaInmueble {
    tipoPropiedad: string;
    habitaciones: number;
    banos: number;
    metrosCuadrados: number;
    garaje: boolean;
    piscina: boolean;
    jardin: boolean;
    terraza: boolean;
    ubicacion?: string;
    antiguedad?: number;
  }
  
  export interface IEstimacionPrecio {
    precioEstimado: number;
    rangoMinimo: number;
    rangoMaximo: number;
    moneda: string;
    factoresConsiderados: {
      precioBaseMercado: number;
      ajustesPorCaracteristicas: number;
      factoresAdicionales?: Record<string, number>;
    };
    confianzaPrediccion: number;
  }
  
  export interface ITendenciaMercado {
    tendencia: string;
    demanda: string;
    prediccionCortoPlaza: string;
    tiempoPromedioVenta: string;
    factoresInfluyentes: string[];
  }
  
  export interface IResultadoAnalisis {
    estimacion: IEstimacionPrecio;
    caracteristicasDetectadas: ICaracteristicaInmueble;
    recomendaciones: string[];
    tendenciaMercado: ITendenciaMercado;
    analisisContextual?: string;
  }
  
  export interface IFiltro {
    id: string;
    nombre: string;
    tipo: string;
  }
  
  export interface IFiltrosDisponibles {
    ubicaciones: string[];
    tiposPropiedades: string[];
    caracteristicas: IFiltro[];
  }
  
  export interface IDatosMercado {
    precioPromedio: number;
    precioMinimo: number;
    precioMaximo: number;
    metrosCuadradosPromedio: number;
    ofertaDisponible: number;
    tendencia: string;
    zona: string;
    tipoPropiedad: string;
    ultimaActualizacion: string;
    prediccionPrecio?: {
      pronosticoTrimestral: string;
      porcentajeVariacion: number;
      confianza: number;
    };
  }