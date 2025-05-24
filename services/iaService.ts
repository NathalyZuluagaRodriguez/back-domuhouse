import { 
  ICaracteristicaInmueble, 
  IEstimacionPrecio, 
  IResultadoAnalisis, 
  IFiltrosDisponibles,
  IDatosMercado
} from '../models/interfaces';
import { geminiClient } from '../utils/GeminiClient';

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
  'Centro': {
    'Casa': {
      precioPromedio: 350000,
      precioMinimo: 200000,
      precioMaximo: 500000,
      metrosCuadradosPromedio: 120,
      ofertaDisponible: 25,
      tendencia: 'alza'
    },
    'Apartamento': {
      precioPromedio: 180000,
      precioMinimo: 120000,
      precioMaximo: 250000,
      metrosCuadradosPromedio: 75,
      ofertaDisponible: 43,
      tendencia: 'estable'
    }
  },
  'Sur': {
    'Casa': {
      precioPromedio: 280000,
      precioMinimo: 180000,
      precioMaximo: 420000,
      metrosCuadradosPromedio: 150,
      ofertaDisponible: 18,
      tendencia: 'alza'
    },
    'Apartamento': {
      precioPromedio: 150000,
      precioMinimo: 100000,
      precioMaximo: 220000,
      metrosCuadradosPromedio: 85,
      ofertaDisponible: 32,
      tendencia: 'estable'
    }
  },
  'Norte': {
    'Casa': {
      precioPromedio: 380000,
      precioMinimo: 220000,
      precioMaximo: 550000,
      metrosCuadradosPromedio: 140,
      ofertaDisponible: 22,
      tendencia: 'alza'
    },
    'Apartamento': {
      precioPromedio: 200000,
      precioMinimo: 130000,
      precioMaximo: 280000,
      metrosCuadradosPromedio: 90,
      ofertaDisponible: 38,
      tendencia: 'alza'
    }
  },
  'Este': {
    'Casa': {
      precioPromedio: 320000,
      precioMinimo: 190000,
      precioMaximo: 460000,
      metrosCuadradosPromedio: 130,
      ofertaDisponible: 20,
      tendencia: 'estable'
    },
    'Apartamento': {
      precioPromedio: 170000,
      precioMinimo: 110000,
      precioMaximo: 240000,
      metrosCuadradosPromedio: 80,
      ofertaDisponible: 35,
      tendencia: 'estable'
    }
  },
  'Oeste': {
    'Casa': {
      precioPromedio: 300000,
      precioMinimo: 180000,
      precioMaximo: 430000,
      metrosCuadradosPromedio: 135,
      ofertaDisponible: 19,
      tendencia: 'estable'
    },
    'Apartamento': {
      precioPromedio: 160000,
      precioMinimo: 105000,
      precioMaximo: 230000,
      metrosCuadradosPromedio: 78,
      ofertaDisponible: 30,
      tendencia: 'baja'
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
          precioPromedio: tipo === 'Terreno' ? 200000 : tipo === 'Local Comercial' ? 250000 : 230000,
          precioMinimo: tipo === 'Terreno' ? 120000 : tipo === 'Local Comercial' ? 150000 : 140000,
          precioMaximo: tipo === 'Terreno' ? 300000 : tipo === 'Local Comercial' ? 380000 : 350000,
          metrosCuadradosPromedio: tipo === 'Terreno' ? 500 : tipo === 'Local Comercial' ? 100 : 90,
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
export const analizarInmueble = async (
  descripcion: string, 
  ubicacion: string = 'Centro', 
  caracteristicas: Partial<ICaracteristicaInmueble> = {}
): Promise<IResultadoAnalisis> => {
  try {
    // Análisis de texto para extraer características del inmueble usando IA
    const caracteristicasExtraidas = await geminiClient.extraerCaracteristicas(descripcion);
    
    // Combinar características extraídas con las proporcionadas
    const caracteristicasCompletas: ICaracteristicaInmueble = {
      ...caracteristicasExtraidas,
      ...caracteristicas,
      ubicacion: ubicacion || caracteristicasExtraidas.ubicacion || 'Centro'
    };
    
    // Validar que la ubicación exista en los datos de mercado
    const ubicacionValida = caracteristicasCompletas.ubicacion && 
      caracteristicasCompletas.ubicacion in datosMercadoSimulados ? 
      caracteristicasCompletas.ubicacion : 'Centro';
    
    // Obtener datos del mercado para la ubicación y tipo de propiedad
    const datosMercadoZona = datosMercadoSimulados[ubicacionValida];
    
    // Validar que el tipo de propiedad exista en los datos de mercado
    const tipoValido = caracteristicasCompletas.tipoPropiedad in datosMercadoZona ? 
      caracteristicasCompletas.tipoPropiedad : 'Casa';
    
    const datosTipoPropiedad = datosMercadoZona[tipoValido];
    
    // Calcular estimación de precio con IA
    const estimacion = await geminiClient.estimarPrecio(caracteristicasCompletas, datosTipoPropiedad);
    
    // Recomendaciones basadas en el análisis con IA
    const recomendaciones = await geminiClient.generarRecomendaciones(caracteristicasCompletas, estimacion);
    
    // Análisis de tendencia de mercado con IA
    const tendencia = await geminiClient.analizarTendenciaMercado(
      ubicacionValida,
      tipoValido,
      datosTipoPropiedad
    );
    
    return {
      estimacion,
      caracteristicasDetectadas: caracteristicasCompletas,
      recomendaciones,
      tendenciaMercado: tendencia
    };
  } catch (error) {
    console.error('Error en el análisis del inmueble:', error);
    
    // Devolver un resultado por defecto en caso de error
    return {
      estimacion: {
        precioEstimado: 250000,
        rangoMinimo: 225000,
        rangoMaximo: 275000,
        moneda: 'USD',
        factoresConsiderados: {
          precioBaseMercado: 250000,
          ajustesPorCaracteristicas: 0
        },
        confianzaPrediccion: 0.7
      },
      caracteristicasDetectadas: {
        tipoPropiedad: 'Casa',
        habitaciones: 3,
        banos: 2,
        metrosCuadrados: 120,
        garaje: false,
        piscina: false,
        jardin: false,
        terraza: false,
        ubicacion: ubicacion || 'Centro'
      },
      recomendaciones: [
        'Para una valoración más precisa, considere solicitar una visita de un tasador profesional.'
      ],
      tendenciaMercado: {
        tendencia: 'estable',
        demanda: 'Media',
        prediccionCortoPlaza: 'Se espera que los precios se mantengan estables en los próximos meses',
        tiempoPromedioVenta: '90 días',
        factoresInfluyentes: ['Condiciones económicas generales', 'Oferta y demanda local']
      }
    };
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
    
    // Devolver un análisis básico en caso de error
    return {
      tendencia: datosMercadoSimulados.Centro.Casa.tendencia,
      proyeccionCortoPlaza: 'Se espera que los precios se mantengan estables en los próximos 3-6 meses',
      proyeccionMedianoPlaza: 'Condicionada a factores macroeconómicos',
      factoresInfluyentes: [
        'Tasas de interés',
        'Oferta y demanda local',
        'Situación económica general',
        'Desarrollo de infraestructuras en la zona'
      ],
      recomendacionesInversores: [
        'Diversificar cartera inmobiliaria',
        'Considerar propiedades con potencial de revalorización',
        'Evaluar cuidadosamente la relación precio-calidad'
      ],
      indicadoresEconomicos: {
        impactoTasasInteres: 'Moderado',
        impactoInflacion: 'Medio',
        impactoEmpleo: 'Bajo'
      },
      confianzaAnalisis: 0.75
    };
  }
};

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
    
    // Devolver una comparación básica en caso de error
    return {
      precioOfertado,
      diferenciaPorcentual: 0,
      precioPromedioZona: 250000,
      posicionCompetitiva: 'En línea con el mercado',
      recomendacionesEstrategicas: [
        'Revisar el precio según las características de la propiedad',
        'Destacar elementos diferenciales en la promoción'
      ],
      tiempoEstimadoVenta: '90 días'
    };
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
    const resultadoAnalisis = await analizarInmueble(descripcion, ubicacion, caracteristicas);
    
    // Obtener datos de mercado para comparación
    const datosMercado = await obtenerEstadisticasMercado(
      ubicacion || 'Centro',
      resultadoAnalisis.caracteristicasDetectadas.tipoPropiedad
    );
    
    // Generar comparativa de propiedades similares
    const comparativa = await compararPropiedadesSimilares(
      resultadoAnalisis.caracteristicasDetectadas,
      resultadoAnalisis.estimacion.precioEstimado
    );
    
    // Analizar tendencias de mercado específicas
    const tendencias = await analizarTendenciasMercado(
      ubicacion || 'Centro',
      resultadoAnalisis.caracteristicasDetectadas.tipoPropiedad
    );
    
    // Estructurar el informe completo
    return {
      fechaInforme: new Date().toISOString().split('T')[0],
      codigoReferencia: `VAL-${Date.now().toString().slice(-8)}`,
      resultadoAnalisis,
      datosMercado,
      comparativaCompetitiva: comparativa,
      tendenciasMercado: tendencias,
      conclusiones: {
        valorOptimo: resultadoAnalisis.estimacion.precioEstimado,
        rangoNegociacion: {
          minimo: resultadoAnalisis.estimacion.rangoMinimo,
          maximo: resultadoAnalisis.estimacion.rangoMaximo
        },
        estrategiaRecomendada: comparativa.posicionCompetitiva === 'Por encima del mercado' ?
          'Ajustar precio para alinearse con el mercado' : 'Mantener precio destacando características distintivas',
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