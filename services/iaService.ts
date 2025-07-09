import { 
  ICaracteristicaInmueble, 
  IEstimacionPrecio, 
  IResultadoAnalisis, 
  IFiltrosDisponibles,
  IDatosMercado
} from '../models/interfaces';
import { geminiClient } from '../utils/GeminiClient';
import { ErrorResponse } from '../models/interfaces';



// Datos de mercado para complementar la IA
// En producción, estos datos vendrían de una base de datos actualizada
interface IMercadoData {
  precioPromedio: number;
  precioMinimo: number;
  precioMaximo: number;
  metrosCuadradosPromedio: number;
  ofertaDisponible: number;
  tendencia: string;
}

interface ITiposPropiedades {
  [key: string]: IMercadoData;
}

interface IZonasMercado {
  [key: string]: ITiposPropiedades;
}

const datosMercadoSimulados: IZonasMercado = {
  Bogotá: {
    Centro: {
      precioPromedio: 4500000, precioMinimo: 3000000, precioMaximo: 7000000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 120, tendencia: 'estable'
    },
    Norte: {
      precioPromedio: 6500000, precioMinimo: 5000000, precioMaximo: 8000000,
      metrosCuadradosPromedio: 85, ofertaDisponible: 90, tendencia: 'alza'
    },
    Sur: {
      precioPromedio: 3800000, precioMinimo: 2500000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 85, ofertaDisponible: 100, tendencia: 'estable'
    },
    Este: {
      precioPromedio: 5400000, precioMinimo: 4500000, precioMaximo: 6500000,
      metrosCuadradosPromedio: 85, ofertaDisponible: 90, tendencia: 'estable'
    },
    Oeste: {
      precioPromedio: 4800000, precioMinimo: 4000000, precioMaximo: 6500000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 110, tendencia: 'estable'
    }
  },
  Medellín: {
    Centro: {
      precioPromedio: 3905405, precioMinimo: 3000000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 90, tendencia: 'alza'
    },
    Norte: {
      precioPromedio: 6626127, precioMinimo: 5500000, precioMaximo: 8000000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 70, tendencia: 'alza'
    },
    Sur: {
      precioPromedio: 3905405, precioMinimo: 3000000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 80, tendencia: 'estable'
    },
    Este: {
      precioPromedio: 6426000, precioMinimo: 5000000, precioMaximo: 8000000,
      metrosCuadradosPromedio: 85, ofertaDisponible: 60, tendencia: 'alza'
    },
    Oeste: {
      precioPromedio: 4264000, precioMinimo: 3000000, precioMaximo: 6000000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 60, tendencia: 'estable'
    }
  },
  Cali: {
    Centro: {
      precioPromedio: 4560000, precioMinimo: 3000000, precioMaximo: 6500000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 50, tendencia: 'estable'
    },
    Norte: {
      precioPromedio: 4500000, precioMinimo: 3200000, precioMaximo: 7000000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 40, tendencia: 'alza'
    },
    Sur: {
      precioPromedio: 3500000, precioMinimo: 2500000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 85, ofertaDisponible: 60, tendencia: 'estable'
    },
    Este: {
      precioPromedio: 4000000, precioMinimo: 3000000, precioMaximo: 5500000,
      metrosCuadradosPromedio: 80, ofertaDisponible: 45, tendencia: 'estable'
    },
    Oeste: {
      precioPromedio: 3800000, precioMinimo: 2800000, precioMaximo: 5200000,
      metrosCuadradosPromedio: 78, ofertaDisponible: 50, tendencia: 'estable'
    }
  },
  Barranquilla: {
    Centro: {
      precioPromedio: 3790000, precioMinimo: 3000000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 70, ofertaDisponible: 50, tendencia: 'alza'
    },
    Norte: {
      precioPromedio: 4230000, precioMinimo: 3000000, precioMaximo: 6000000,
      metrosCuadradosPromedio: 70, ofertaDisponible: 40, tendencia: 'alza'
    },
    Sur: {
      precioPromedio: 3000000, precioMinimo: 2000000, precioMaximo: 4500000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 45, tendencia: 'estable'
    },
    Este: {
      precioPromedio: 3400000, precioMinimo: 2500000, precioMaximo: 5000000,
      metrosCuadradosPromedio: 72, ofertaDisponible: 30, tendencia: 'estable'
    },
    Oeste: {
      precioPromedio: 3100000, precioMinimo: 2200000, precioMaximo: 4600000,
      metrosCuadradosPromedio: 70, ofertaDisponible: 35, tendencia: 'estable'
    }
  },
  Cartagena: {
    Centro: {
      precioPromedio: 6624706, precioMinimo: 4000000, precioMaximo: 10000000,
      metrosCuadradosPromedio: 70, ofertaDisponible: 45, tendencia: 'alza'
    },
    Norte: {
      precioPromedio: 6200000, precioMinimo: 4000000, precioMaximo: 9000000,
      metrosCuadradosPromedio: 70, ofertaDisponible: 40, tendencia: 'alza'
    },
    Sur: {
      precioPromedio: 5500000, precioMinimo: 3500000, precioMaximo: 8000000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 30, tendencia: 'alza'
    },
    Este: {
      precioPromedio: 6000000, precioMinimo: 3800000, precioMaximo: 9000000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 25, tendencia: 'alza'
    },
    Oeste: {
      precioPromedio: 5800000, precioMinimo: 3500000, precioMaximo: 8500000,
      metrosCuadradosPromedio: 75, ofertaDisponible: 25, tendencia: 'alza'
    }
  }
};


// Añadir tipos de propiedades faltantes
const completarTiposPropiedades = () => {
  const tiposAdicionales = ['Terreno', 'Local Comercial', 'Oficina'];
  const zonas = Object.keys(datosMercadoSimulados);

  for (const zona of zonas) {
    for (const tipo of tiposAdicionales) {
      if (!datosMercadoSimulados[zona][tipo]) {
        // Crear datos por defecto para los tipos faltantes
        datosMercadoSimulados[zona][tipo] = {
          precioPromedio: tipo === 'Terreno' ? 200000000 : tipo === 'Local Comercial' ? 250000000 : 230000000,
          precioMinimo: tipo === 'Terreno' ? 120000000 : tipo === 'Local Comercial' ? 150000000 : 140000000,
          precioMaximo: tipo === 'Terreno' ? 300000000 : tipo === 'Local Comercial' ? 380000000 : 350000000,
          metrosCuadradosPromedio: tipo === 'Terreno' ? 500000 : tipo === 'Local Comercial' ? 100000 : 900000,
          ofertaDisponible: 15,
          tendencia: 'estable'
        };
      }
    }
  }
};

// Inicializar datos completos
completarTiposPropiedades();

/**
 * Analiza un inmueble basado en su descripción y características opcionales
 */

export const caracteristicasDetectadas = async (
  descripcion: string,
  ubicacion: string = 'Centro'
): Promise<{
  caracteristicasDetectadas: ICaracteristicaInmueble;
  resumenIA: string;
  datosMercadoZona: IMercadoData;
} | ErrorResponse> => {
  try {
    const caracteristicas = await geminiClient.extraerCaracteristicas(descripcion) as ICaracteristicaInmueble | ErrorResponse;

    if ('message' in caracteristicas) {
      return { message: caracteristicas.message };
    }

    const ubicacionDetectada = caracteristicas.ubicacion ?? 'Centro';
    const tipoDetectado = caracteristicas.tipoPropiedad ?? 'Casa';

    const ubicacionValida = datosMercadoSimulados[ubicacionDetectada]
      ? ubicacionDetectada
      : 'Centro';

    const tipoValido = datosMercadoSimulados[ubicacionValida]?.[tipoDetectado]
      ? tipoDetectado
      : 'Casa';

    const datosMercadoZona = datosMercadoSimulados[ubicacionValida]?.[tipoValido];

    return {
      caracteristicasDetectadas: caracteristicas,
      resumenIA: '', // aquí iría tu resumen
      datosMercadoZona
    };
  } catch (error) {
    return { message: 'Ocurrió un error procesando las características' };
  }
};


/**
 * Obtiene los filtros disponibles para el análisis de inmuebles
 */
export const obtenerFiltrosDisponibles = async (): Promise<IFiltrosDisponibles> => {
  try {
    // Devuelve los filtros disponibles para el análisis
    return {
      ubicaciones: Object.keys(datosMercadoSimulados), // Usar las claves de nuestro objeto de datos
      tiposPropiedades: ['Casa', 'Apartamento', 'Terreno', 'Local Comercial', 'Oficina'],
      caracteristicas: [
        { id: 'habitaciones', nombre: 'Habitaciones', tipo: 'numero' },
        { id: 'banos', nombre: 'Baños', tipo: 'numero' },
        { id: 'metrosCuadrados', nombre: 'Metros Cuadrados', tipo: 'numero' },
        { id: 'antiguedad', nombre: 'Antigüedad (años)', tipo: 'numero' },
        { id: 'garaje', nombre: 'Garaje', tipo: 'booleano' },
        { id: 'piscina', nombre: 'Piscina', tipo: 'booleano' },
        { id: 'jardin', nombre: 'Jardín', tipo: 'booleano' },
        { id: 'terraza', nombre: 'Terraza', tipo: 'booleano' }
      ]
    };
  } catch (error) {
    console.error('Error al obtener filtros disponibles:', error);
    // Devolver filtros por defecto en caso de error
    return {
      ubicaciones: ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'],
      tiposPropiedades: ['Casa', 'Apartamento', 'Terreno', 'Local Comercial', 'Oficina'],
      caracteristicas: [
        { id: 'habitaciones', nombre: 'Habitaciones', tipo: 'numero' },
        { id: 'banos', nombre: 'Baños', tipo: 'numero' },
        { id: 'metrosCuadrados', nombre: 'Metros Cuadrados', tipo: 'numero' },
        { id: 'garaje', nombre: 'Garaje', tipo: 'booleano' }
      ]
    };
  }
};

/**
 * Obtiene estadísticas del mercado inmobiliario para una zona y tipo de propiedad específicos
 */
export const obtenerEstadisticasMercado = async (
  zona: string = 'Centro', 
  tipoPropiedad: string = 'Casa'
): Promise<IDatosMercado> => {
  try {
    // Validar que la zona exista en los datos
    if (!datosMercadoSimulados[zona]) {
      zona = 'Centro';
    }
    
    // Validar que el tipo de propiedad exista en la zona
    if (!datosMercadoSimulados[zona][tipoPropiedad]) {
      tipoPropiedad = 'Casa';
    }
    
    // En un escenario real, estos datos vendrían de una API o base de datos
    const datosMercadoZona = datosMercadoSimulados[zona];
    const datosTipoPropiedad = datosMercadoZona[tipoPropiedad];
    
    // Datos para la predicción
    let pronosticoTrimestral, porcentajeVariacion;
    
    if (datosTipoPropiedad.tendencia === 'alza') {
      pronosticoTrimestral = 'Incremento del 3-5%';
      porcentajeVariacion = 4;
    } else if (datosTipoPropiedad.tendencia === 'baja') {
      pronosticoTrimestral = 'Disminución del 2-4%';
      porcentajeVariacion = -3;
    } else {
      pronosticoTrimestral = 'Estabilidad con variaciones mínimas';
      porcentajeVariacion = 0.5;
    }
    
    return {
      ...datosTipoPropiedad,
      zona,
      tipoPropiedad,
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      prediccionPrecio: {
        pronosticoTrimestral,
        porcentajeVariacion,
        confianza: 0.85
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del mercado:', error);
    
    // Devolver estadísticas por defecto en caso de error
    return {
      precioPromedio: 250000,
      precioMinimo: 180000,
      precioMaximo: 350000,
      metrosCuadradosPromedio: 120,
      ofertaDisponible: 25,
      tendencia: 'estable',
      zona: zona || 'Centro',
      tipoPropiedad: tipoPropiedad || 'Casa',
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      prediccionPrecio: {
        pronosticoTrimestral: 'Estabilidad con variaciones mínimas',
        porcentajeVariacion: 0.5,
        confianza: 0.8
      }
    };
  }
};

/**
 * Analiza tendencias del mercado inmobiliario con factores adicionales
 */
export const analizarTendenciasMercado = async (
  zona: string,
  tipoPropiedad: string,
  factoresAdicionales: Record<string, any> = {}
): Promise<any> => {
    try {
      // Validar que la zona exista en los datos
      if (!datosMercadoSimulados[zona]) {
        zona = 'Centro';
      }
      
      // Validar que el tipo de propiedad exista en la zona
      if (!datosMercadoSimulados[zona][tipoPropiedad]) {
        tipoPropiedad = 'Casa';
      }
      
      // Obtener datos base del mercado
      const datosMercadoZona = datosMercadoSimulados[zona];
      const datosTipoPropiedad = datosMercadoZona[tipoPropiedad];
      
      try {
        // Utilizar IA para un análisis más profundo de tendencias
        const prompt = `Eres un analista experto en el mercado inmobiliario. Realiza un análisis detallado
        de las tendencias del mercado para la zona y tipo de propiedad especificados, considerando 
        los factores adicionales proporcionados. Incluye proyecciones a corto y mediano plazo, 
        factores macroeconómicos, y recomendaciones para inversores. Responde con un objeto JSON 
        estructurado con análisis detallado.
        
        Zona: ${zona}
        Tipo de propiedad: ${tipoPropiedad}
        Datos del mercado: ${JSON.stringify(datosTipoPropiedad)}
        Factores adicionales: ${JSON.stringify(factoresAdicionales)}`;

        const result = await geminiClient.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extraer solo el objeto JSON de la respuesta
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('Error al analizar tendencias con IA avanzada:', error);
        throw new Error('Error en el análisis avanzado con IA');
      }
    } catch (error) {
      console.error('Error global en análisis de tendencias de mercado:', error);
      
      
    };
  }

/**
 * Compara propiedades similares para evaluar competitividad de precios
 */
export const compararPropiedadesSimilares = async (
  caracteristicas: ICaracteristicaInmueble,
  precioOfertado: number
): Promise<any> => {
  try {
    // Extraer información relevante
    const { tipoPropiedad, ubicacion = 'Centro', metrosCuadrados } = caracteristicas;
    
    // Validar ubicación y tipo de propiedad
    const ubicacionValida = ubicacion in datosMercadoSimulados ? ubicacion : 'Centro';
    const tipoValido = tipoPropiedad in datosMercadoSimulados[ubicacionValida] ? 
      tipoPropiedad : 'Casa';
    
    // Obtener datos de mercado para la comparación
    const datosMercado = datosMercadoSimulados[ubicacionValida][tipoValido];
    
    // Calcular precio por metro cuadrado
    const precioMetroCuadrado = precioOfertado / (metrosCuadrados || 100);
    const precioPromedioMetroCuadrado = datosMercado.precioPromedio / datosMercado.metrosCuadradosPromedio;
    
    // Determinar posición competitiva
    const diferenciaPorcentual = ((precioMetroCuadrado / precioPromedioMetroCuadrado) - 1) * 100;
    
    let posicionCompetitiva;
    if (diferenciaPorcentual < -10) {
      posicionCompetitiva = 'Por debajo del mercado';
    } else if (diferenciaPorcentual > 10) {
      posicionCompetitiva = 'Por encima del mercado';
    } else {
      posicionCompetitiva = 'En línea con el mercado';
    }
    
    // Usar IA para generar recomendaciones de posicionamiento
    const prompt = `Eres un consultor inmobiliario experto. Analiza la posición competitiva 
    de una propiedad en el mercado y genera recomendaciones de posicionamiento y estrategia de venta. 
    Responde con un objeto JSON estructurado.
    
    Características de la propiedad: ${JSON.stringify(caracteristicas)}
    Precio ofertado: ${precioOfertado}
    Datos del mercado: ${JSON.stringify(datosMercado)}
    Diferencia porcentual con el mercado: ${diferenciaPorcentual.toFixed(2)}%
    Posición competitiva actual: ${posicionCompetitiva}`;

    try {
      const result = await geminiClient.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer solo el objeto JSON de la respuesta
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const recomendaciones = JSON.parse(jsonStr);
      
      return {
        precioOfertado,
        diferenciaPorcentual: parseFloat(diferenciaPorcentual.toFixed(2)),
        precioPromedioZona: datosMercado.precioPromedio,
        precioMetroCuadrado: parseFloat(precioMetroCuadrado.toFixed(2)),
        precioPromedioMetroCuadrado: parseFloat(precioPromedioMetroCuadrado.toFixed(2)),
        posicionCompetitiva,
        recomendacionesEstrategicas: recomendaciones.recomendaciones || [
          'Revisar el precio según la posición competitiva actual',
          'Destacar características diferenciales de la propiedad'
        ],
        tiempoEstimadoVenta: recomendaciones.tiempoEstimadoVenta || '90 días'
      };
    } catch (error) {
      console.error('Error al generar recomendaciones con IA:', error);
      throw new Error('Error en generación de recomendaciones');
    }
  } catch (error) {
    console.error('Error al comparar propiedades similares:', error);
  }
};

/**
 * Genera un informe completo de valoración inmobiliaria
 */
export const generarInformeValoracion = async (
  descripcion: string,
  ubicacion: string,
  caracteristicas: Partial<ICaracteristicaInmueble>
): Promise<any> => {
  try {
    // Realizar análisis completo del inmueble
    const resultadoAnalisis = await caracteristicasDetectadas(descripcion, ubicacion);

    if ('message' in resultadoAnalisis) {
      throw new Error(resultadoAnalisis.message);
    }

    const datosMercado = await obtenerEstadisticasMercado(
      ubicacion || 'Centro',
      resultadoAnalisis.caracteristicasDetectadas.tipoPropiedad
    );

    const comparativa = await compararPropiedadesSimilares(
      resultadoAnalisis.caracteristicasDetectadas,
      datosMercado.precioPromedio // o el valor correcto
    );

    const tendencias = await analizarTendenciasMercado(
      ubicacion || 'Centro',
      resultadoAnalisis.caracteristicasDetectadas.tipoPropiedad
    );

    
    // Calcular estimación de precio basado en datos del mercado
const estimacion = {
  precioEstimado: datosMercado.precioPromedio,
  rangoMinimo: datosMercado.precioPromedio * 0.95,
  rangoMaximo: datosMercado.precioPromedio * 1.05
};

// Estructurar el informe completo
return {
  fechaInforme: new Date().toISOString().split('T')[0],
  codigoReferencia: `VAL-${Date.now().toString().slice(-8)}`,
  resultadoAnalisis,
  datosMercado,
  comparativaCompetitiva: comparativa,
  tendenciasMercado: tendencias,
  conclusiones: {
    valorOptimo: estimacion.precioEstimado,
    rangoNegociacion: {
      minimo: estimacion.rangoMinimo,
      maximo: estimacion.rangoMaximo
    },
    estrategiaRecomendada:
      comparativa.posicionCompetitiva === 'Por encima del mercado'
        ? 'Ajustar precio para alinearse con el mercado'
        : 'Mantener precio destacando características distintivas',
    tiempoEstimadoVenta: comparativa.tiempoEstimadoVenta
  },
  metodologiaValoracion: [
    'Análisis comparativo de mercado',
    'Evaluación de características y estado',
    'Proyección de tendencias inmobiliarias',
    'Inteligencia artificial avanzada'
  ]
};

  } catch (error) {
    console.error('Error al generar informe de valoración:', error);
    
    // Devolver un informe básico en caso de error
    return {
      fechaInforme: new Date().toISOString().split('T')[0],
      codigoReferencia: `VAL-${Date.now().toString().slice(-8)}`,
      mensaje: 'No se pudo generar el informe detallado debido a un error técnico',
      recomendacion: 'Intente de nuevo más tarde o contacte con nuestro servicio de atención al cliente'
    };
  }
};