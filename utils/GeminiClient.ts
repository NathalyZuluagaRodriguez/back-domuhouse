import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICaracteristicaInmueble, IEstimacionPrecio, ITendenciaMercado } from '../models/interfaces';

// Tasa de cambio USD a COP (se puede actualizar con una API en producción)
const USD_TO_COP_RATE = 3950; // Ejemplo de tasa: 1 USD = 3950 COP

// Cliente de Gemini para interactuar con la API
class GeminiClient {
  client: GoogleGenerativeAI;
  model: any; // El modelo generativo de Gemini
  tasaCambioCOP: number;

  constructor(tasaCambio: number = USD_TO_COP_RATE) {
    // Asegúrate de que la API key esté configurada en tus variables de entorno
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    // Actualizado: Usar el modelo correcto disponible en la API
    this.model = this.client.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Guardar la tasa de cambio
    this.tasaCambioCOP = tasaCambio;
  }

  /**
   * Convierte un valor de USD a COP
   */
  convertirUSDaCOP(valorUSD: number): number {
    return Math.round(valorUSD * this.tasaCambioCOP);
  }

  /**
   * Analiza un texto de descripción de inmueble para extraer características
   */
  async extraerCaracteristicas(descripcion: string): Promise<ICaracteristicaInmueble> {
    try {
      const prompt = `Eres un asistente especializado en análisis inmobiliario. Extrae todas las características 
      posibles de la propiedad a partir de la descripción proporcionada. Responde SOLO con un objeto JSON 
      que contenga los siguientes campos, sin explicaciones adicionales:
      {
        "tipoPropiedad": string (Casa, Apartamento, Terreno, Local Comercial, Oficina),
        "habitaciones": number,
        "banos": number,
        "metrosCuadrados": number,
        "garaje": boolean,
        "piscina": boolean,
        "jardin": boolean,
        "terraza": boolean,
        "ubicacion": string (opcional),
        "antiguedad": number (opcional, en años)
      }
      Si no encuentras información para alguno de los campos, asigna valores por defecto: 0 para números, false para booleanos,
      y "No especificado" para strings.

      Descripción: ${descripcion}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer solo el objeto JSON de la respuesta
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const caracteristicas = JSON.parse(jsonStr);

      // Asegurar que todos los campos estén presentes
      return {
        tipoPropiedad: caracteristicas.tipoPropiedad || 'Casa',
        habitaciones: Number(caracteristicas.habitaciones) || 0,
        banos: Number(caracteristicas.banos) || 0,
        metrosCuadrados: Number(caracteristicas.metrosCuadrados) || 0,
        garaje: Boolean(caracteristicas.garaje) || false,
        piscina: Boolean(caracteristicas.piscina) || false,
        jardin: Boolean(caracteristicas.jardin) || false,
        terraza: Boolean(caracteristicas.terraza) || false,
        ubicacion: caracteristicas.ubicacion || undefined,
        antiguedad: caracteristicas.antiguedad !== undefined ? Number(caracteristicas.antiguedad) : undefined
      };
    } catch (error) {
      console.error('Error al extraer características con IA:', error);
      // Devolver valores por defecto en caso de error
      return {
        tipoPropiedad: 'Casa',
        habitaciones: 0,
        banos: 0,
        metrosCuadrados: 0,
        garaje: false,
        piscina: false,
        jardin: false,
        terraza: false
      };
    }
  }

  /**
   * Usa el modelo de IA para estimar el precio de un inmueble
   */
  async estimarPrecio(
    caracteristicas: ICaracteristicaInmueble,
    datosMercado: any
  ): Promise<IEstimacionPrecio> {
    try {
      const prompt = `Eres un estimador inmobiliario experto. Calcula el precio estimado de una propiedad
      basándote en sus características y los datos del mercado. Responde SOLO con un objeto JSON 
      que contenga los siguientes campos, sin explicaciones adicionales:
      {
        "precioEstimado": number,
        "rangoMinimo": number,
        "rangoMaximo": number,
        "moneda": "USD",
        "factoresConsiderados": {
          "precioBaseMercado": number,
          "ajustesPorCaracteristicas": number,
          "factoresAdicionales": {
            // Factores específicos y sus valores numéricos
          }
        },
        "confianzaPrediccion": number (entre 0 y 1)
      }
      
      Características de la propiedad: ${JSON.stringify(caracteristicas)}
      Datos del mercado: ${JSON.stringify(datosMercado)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer solo el objeto JSON de la respuesta
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const estimacionUSD = JSON.parse(jsonStr);

      // Convertir valores de USD a COP
      const precioBaseUSD = Number(estimacionUSD.precioEstimado) || datosMercado.precioPromedio || 200000;
      const rangoMinimoUSD = Number(estimacionUSD.rangoMinimo) || precioBaseUSD * 0.9;
      const rangoMaximoUSD = Number(estimacionUSD.rangoMaximo) || precioBaseUSD * 1.1;
      const precioBaseMercadoUSD = Number(estimacionUSD.factoresConsiderados?.precioBaseMercado) || datosMercado.precioPromedio || 200000;
      const ajustesPorCaracteristicasUSD = Number(estimacionUSD.factoresConsiderados?.ajustesPorCaracteristicas) || 0;

      // Asegurar que todos los campos estén presentes con valores en COP
      return {
        precioEstimado: this.convertirUSDaCOP(precioBaseUSD),
        rangoMinimo: this.convertirUSDaCOP(rangoMinimoUSD),
        rangoMaximo: this.convertirUSDaCOP(rangoMaximoUSD),
        moneda: 'COP',
        factoresConsiderados: {
          precioBaseMercado: this.convertirUSDaCOP(precioBaseMercadoUSD),
          ajustesPorCaracteristicas: this.convertirUSDaCOP(ajustesPorCaracteristicasUSD),
          factoresAdicionales: estimacionUSD.factoresConsiderados?.factoresAdicionales || {}
        },
        confianzaPrediccion: Number(estimacionUSD.confianzaPrediccion) || 0.7
      };
    } catch (error) {
      console.error('Error al estimar precio con IA:', error);
      // Devolver una estimación por defecto en caso de error con valores en COP
      const precioPromedioUSD = datosMercado.precioPromedio || 200000;
      return {
        precioEstimado: this.convertirUSDaCOP(precioPromedioUSD),
        rangoMinimo: this.convertirUSDaCOP(precioPromedioUSD * 0.9),
        rangoMaximo: this.convertirUSDaCOP(precioPromedioUSD * 1.1),
        moneda: 'COP',
        factoresConsiderados: {
          precioBaseMercado: this.convertirUSDaCOP(precioPromedioUSD),
          ajustesPorCaracteristicas: 0
        },
        confianzaPrediccion: 0.7
      };
    }
  }

  /**
   * Genera recomendaciones basadas en el análisis del inmueble
   */
  async generarRecomendaciones(
    caracteristicas: ICaracteristicaInmueble,
    estimacion: IEstimacionPrecio
  ): Promise<string[]> {
    try {
      const prompt = `Eres un consultor inmobiliario experto. Genera recomendaciones estratégicas 
      para maximizar el valor y atractivo de una propiedad basándote en sus características 
      y estimación de precio. Responde SOLO con un array JSON de strings que contenga 
      recomendaciones concretas, sin explicaciones adicionales.
      
      Características de la propiedad: ${JSON.stringify(caracteristicas)}
      Estimación de precio: ${JSON.stringify(estimacion)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Intentar obtener el array JSON de la respuesta
      let jsonText = text;
      if (text.includes('[') && text.includes(']')) {
        jsonText = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
      }

      try {
        const recomendacionesResponse = JSON.parse(jsonText);
        
        // Manejo de diferentes formatos posibles de respuesta
        let recomendaciones: string[] = [];
        if (Array.isArray(recomendacionesResponse)) {
          recomendaciones = recomendacionesResponse;
        } else if (recomendacionesResponse.recomendaciones && Array.isArray(recomendacionesResponse.recomendaciones)) {
          recomendaciones = recomendacionesResponse.recomendaciones;
        } else {
          recomendaciones = ["Para una valoración más precisa, considere solicitar una visita de un tasador profesional."];
        }

        return recomendaciones;
      } catch (parseError) {
        console.error('Error al parsear recomendaciones:', parseError);
        return ["Para una valoración más precisa, considere solicitar una visita de un tasador profesional."];
      }
    } catch (error) {
      console.error('Error al generar recomendaciones con IA:', error);
      return ["Para una valoración más precisa, considere solicitar una visita de un tasador profesional."];
    }
  }

  /**
   * Analiza y predice tendencias del mercado inmobiliario
   */
  async analizarTendenciaMercado(
    ubicacion: string,
    tipoPropiedad: string,
    datosMercado: any
  ): Promise<ITendenciaMercado> {
    try {
      const prompt = `Eres un analista de mercado inmobiliario experto. Analiza las tendencias actuales
      del mercado para la ubicación y tipo de propiedad especificados. Responde SOLO con un objeto JSON 
      que contenga los siguientes campos, sin explicaciones adicionales:
      {
        "tendencia": string (alza, baja, estable),
        "demanda": string (Alta, Media, Baja),
        "prediccionCortoPlaza": string,
        "tiempoPromedioVenta": string,
        "factoresInfluyentes": [string]
      }
      
      Ubicación: ${ubicacion}
      Tipo de propiedad: ${tipoPropiedad}
      Datos del mercado: ${JSON.stringify(datosMercado)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraer solo el objeto JSON de la respuesta
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const tendencia = JSON.parse(jsonStr);

      // Asegurar que todos los campos estén presentes
      return {
        tendencia: tendencia.tendencia || datosMercado.tendencia || 'estable',
        demanda: tendencia.demanda || 'Media',
        prediccionCortoPlaza: tendencia.prediccionCortoPlaza || 'Se espera que los precios se mantengan estables en los próximos meses',
        tiempoPromedioVenta: tendencia.tiempoPromedioVenta || '90 días',
        factoresInfluyentes: Array.isArray(tendencia.factoresInfluyentes) ?
          tendencia.factoresInfluyentes : ['Condiciones económicas generales', 'Oferta y demanda local']
      };
    } catch (error) {
      console.error('Error al analizar tendencia de mercado con IA:', error);
      // Devolver un análisis por defecto en caso de error
      return {
        tendencia: datosMercado.tendencia || 'estable',
        demanda: 'Media',
        prediccionCortoPlaza: 'Se espera que los precios se mantengan estables en los próximos meses',
        tiempoPromedioVenta: '90 días',
        factoresInfluyentes: ['Condiciones económicas generales', 'Oferta y demanda local']
      };
    }
  }

  /**
   * Actualiza la tasa de cambio USD a COP
   */
  actualizarTasaCambio(nuevaTasa: number): void {
    if (nuevaTasa > 0) {
      this.tasaCambioCOP = nuevaTasa;
      console.log(`Tasa de cambio actualizada: 1 USD = ${nuevaTasa} COP`);
    } else {
      console.error('Error: La tasa de cambio debe ser un número positivo');
    }
  }

  /**
   * Obtiene la tasa de cambio actual USD a COP
   */
  obtenerTasaCambio(): number {
    return this.tasaCambioCOP;
  }
}

export const geminiClient = new GeminiClient();