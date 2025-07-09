import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ICaracteristicaInmueble,
  IEstimacionPrecio,
  ITendenciaMercado,
  ErrorResponse
} from '../models/interfaces';

const USD_TO_COP_RATE = 3950;

class GeminiClient {
  client: GoogleGenerativeAI;
  model: any;
  tasaCambioCOP: number;

  constructor(tasaCambio: number = USD_TO_COP_RATE) {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.client.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.tasaCambioCOP = tasaCambio;
  }

  convertirUSDaCOP(valorUSD: number): number {
    return Math.round(valorUSD * this.tasaCambioCOP);
  }

  async extraerCaracteristicas(descripcion: string): Promise<ICaracteristicaInmueble | ErrorResponse> {
  try {
    const prompt = `Eres un asistente especializado en análisis de inmuebles. 
    Solo debes responder descripciones relacionadas con propiedades inmobiliarias reales.
    Si el texto es irrelevante (como preguntas matemáticas, chistes, saludos, etc), responde estrictamente:

    { "error": "Solo respondo análisis de propiedades. Por favor, proporciona una descripción válida." }

    Responde SOLO con un JSON válido:

    {
      "tipoPropiedad": string,
      "habitaciones": number,
      "banos": number,
      "metrosCuadrados": number,
      "garaje": boolean,
      "piscina": boolean,
      "jardin": boolean,
      "terraza": boolean,
      "ubicacion": string,
      "antiguedad": number,
      "estrato": number
    }

    Descripción: ${descripcion}`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const parsed = JSON.parse(json);

    if (parsed.error) {
      console.log("Error de IA:", parsed);
      return { message: parsed.error };
    }

    // Validación y saneamiento de resultados
    const tiposPermitidos = ['Casa', 'Apartamento', 'Local Comercial', 'Terreno'];
    const tipoPropiedadDetectado = parsed.tipoPropiedad?.trim();
    const tipoPropiedad = tiposPermitidos.includes(tipoPropiedadDetectado)
      ? tipoPropiedadDetectado
      : 'Casa';

    return {
      tipoPropiedad,
      habitaciones: Number(parsed.habitaciones) || 0,
      banos: Number(parsed.banos) || 0,
      metrosCuadrados: Number(parsed.metrosCuadrados) || 0,
      garaje: parsed.garaje === true || parsed.garaje === 'true',
      piscina: parsed.piscina === true || parsed.piscina === 'true',
      jardin: parsed.jardin === true || parsed.jardin === 'true',
      terraza: parsed.terraza === true || parsed.terraza === 'true',
      ubicacion: typeof parsed.ubicacion === 'string' ? parsed.ubicacion : 'Centro',
      antiguedad: Number(parsed.antiguedad) || 0,
      estrato: parsed.estrato !== undefined ? Number(parsed.estrato) : undefined
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error inesperado al procesar la descripción';
    return { message: errorMsg };
  }
}


  async estimarPrecio(caracteristicas: ICaracteristicaInmueble, datosMercado: any): Promise<IEstimacionPrecio | ErrorResponse> {
    try {
      const prompt = `Eres un experto en valoración inmobiliaria. 
Si se te consulta algo fuera del contexto de propiedades (como matemáticas, recetas, etc), responde SOLO:

{ "error": "Solo respondo temas relacionados con propiedades inmobiliarias." }

Responde SOLO con un JSON válido:

{
  "precioEstimado": number,
  "rangoMinimo": number,
  "rangoMaximo": number,
  "moneda": "USD",
  "factoresConsiderados": {
    "precioBaseMercado": number,
    "ajustesPorCaracteristicas": number,
    "factoresAdicionales": {}
  },
  "confianzaPrediccion": number
}

Características: ${JSON.stringify(caracteristicas)}
Datos del mercado: ${JSON.stringify(datosMercado)}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const parsed = JSON.parse(json);

      if (parsed.error) return { message: parsed.error };

      return {
        precioEstimado: this.convertirUSDaCOP(parsed.precioEstimado),
        rangoMinimo: this.convertirUSDaCOP(parsed.rangoMinimo),
        rangoMaximo: this.convertirUSDaCOP(parsed.rangoMaximo),
        moneda: 'COP',
        factoresConsiderados: {
          precioBaseMercado: this.convertirUSDaCOP(parsed.factoresConsiderados?.precioBaseMercado),
          ajustesPorCaracteristicas: this.convertirUSDaCOP(parsed.factoresConsiderados?.ajustesPorCaracteristicas),
          factoresAdicionales: parsed.factoresConsiderados?.factoresAdicionales || {}
        },
        confianzaPrediccion: parsed.confianzaPrediccion || 0.7
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado al estimar precio';
      return { message: errorMsg };
    }
  }

  async generarRecomendaciones(caracteristicas: ICaracteristicaInmueble, estimacion: IEstimacionPrecio): Promise<string[] | ErrorResponse> {
    try {
      const prompt = `Eres un asesor inmobiliario profesional. 
Si te preguntan cosas que no tengan relación directa con propiedades, mejoras o valor inmobiliario, responde SOLO:

["Solo respondo temas relacionados con propiedades."]

Devuelve SOLO un array JSON de strings con recomendaciones para aumentar el valor de la propiedad.

Características: ${JSON.stringify(caracteristicas)}
Estimación: ${JSON.stringify(estimacion)}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonText = text.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const parsed = JSON.parse(jsonText);

      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado al generar recomendaciones';
      return { message: errorMsg };
    }
  }

  async analizarTendenciaMercado(ubicacion: string, tipoPropiedad: string, datosMercado: any): Promise<ITendenciaMercado | ErrorResponse> {
    try {
      const prompt = `Eres un analista del mercado inmobiliario. 
No debes responder nada que no esté relacionado con análisis de mercado de propiedades.
Si el texto es irrelevante, responde estrictamente:

{ "error": "Solo analizo tendencias del mercado inmobiliario." }

Responde SOLO con un JSON válido:

{
  "tendencia": string,
  "demanda": string,
  "prediccionCortoPlaza": string,
  "tiempoPromedioVenta": string,
  "factoresInfluyentes": [string]
}

Ubicación: ${ubicacion}
Tipo propiedad: ${tipoPropiedad}
Datos de mercado: ${JSON.stringify(datosMercado)}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const parsed = JSON.parse(json);

      if (parsed.error) return { message: parsed.error };

      return {
        tendencia: parsed.tendencia || 'estable',
        demanda: parsed.demanda || 'Media',
        prediccionCortoPlaza: parsed.prediccionCortoPlaza || 'Sin cambios significativos esperados',
        tiempoPromedioVenta: parsed.tiempoPromedioVenta || '90 días',
        factoresInfluyentes: parsed.factoresInfluyentes || ['Condiciones económicas generales']
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado al analizar tendencias';
      return { message: errorMsg };
    }
  }
}

export const geminiClient = new GeminiClient();
