// Reemplaza TODO el contenido actual por esto
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICaracteristicaInmueble, IEstimacionPrecio, ITendenciaMercado } from '../models/interfaces';

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

  async extraerCaracteristicas(descripcion: string): Promise<ICaracteristicaInmueble> {
    try {
      const prompt = `Eres un asistente especializado en análisis de inmuebles. Si el texto no describe una propiedad, responde con:
{ "error": "Solo respondo análisis de propiedades. Por favor, proporciona una descripción válida." }

Responde SOLO con un JSON:
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
  "antiguedad": number
}

Descripción: ${descripcion}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const json = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
      const parsed = JSON.parse(json);

      if (parsed.error) throw new Error(parsed.error);

      return {
        tipoPropiedad: parsed.tipoPropiedad || 'Casa',
        habitaciones: Number(parsed.habitaciones) || 0,
        banos: Number(parsed.banos) || 0,
        metrosCuadrados: Number(parsed.metrosCuadrados) || 0,
        garaje: Boolean(parsed.garaje),
        piscina: Boolean(parsed.piscina),
        jardin: Boolean(parsed.jardin),
        terraza: Boolean(parsed.terraza),
        ubicacion: parsed.ubicacion || 'No especificado',
        antiguedad: parsed.antiguedad || 0
      };
    } catch (error) {
      console.error('Error:', error);
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

  async estimarPrecio(caracteristicas: ICaracteristicaInmueble, datosMercado: any): Promise<IEstimacionPrecio> {
    try {
      const prompt = `Eres un experto en valoración inmobiliaria. Si se pregunta algo fuera del contexto de propiedades, responde:
{ "error": "Solo respondo temas relacionados con propiedades inmobiliarias." }

Responde SOLO con un JSON:
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

      if (parsed.error) throw new Error(parsed.error);

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
      console.error('Error en estimación IA:', error);
      const fallback = datosMercado.precioPromedio || 200000;
      return {
        precioEstimado: this.convertirUSDaCOP(fallback),
        rangoMinimo: this.convertirUSDaCOP(fallback * 0.9),
        rangoMaximo: this.convertirUSDaCOP(fallback * 1.1),
        moneda: 'COP',
        factoresConsiderados: {
          precioBaseMercado: this.convertirUSDaCOP(fallback),
          ajustesPorCaracteristicas: 0,
          factoresAdicionales: {}
        },
        confianzaPrediccion: 0.7
      };
    }
  }

  async generarRecomendaciones(caracteristicas: ICaracteristicaInmueble, estimacion: IEstimacionPrecio): Promise<string[]> {
    try {
      const prompt = `Eres un asesor inmobiliario. Genera recomendaciones sobre cómo aumentar el valor de una propiedad. Si se pregunta algo fuera de tema, responde:
["Solo respondo temas relacionados con propiedades."]

Responde SOLO con un array JSON de strings.

Características: ${JSON.stringify(caracteristicas)}
Estimación: ${JSON.stringify(estimacion)}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonText = text.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const parsed = JSON.parse(jsonText);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error recomendaciones IA:', error);
      return ["Considere mejoras estructurales o asesoría profesional para aumentar el valor."];
    }
  }

  async analizarTendenciaMercado(ubicacion: string, tipoPropiedad: string, datosMercado: any): Promise<ITendenciaMercado> {
    try {
      const prompt = `Eres un analista del mercado inmobiliario. Si el texto es irrelevante, responde:
{ "error": "Solo analizo tendencias del mercado inmobiliario." }

Responde SOLO con un JSON:
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

      if (parsed.error) throw new Error(parsed.error);

      return {
        tendencia: parsed.tendencia || 'estable',
        demanda: parsed.demanda || 'Media',
        prediccionCortoPlaza: parsed.prediccionCortoPlaza || 'Sin cambios significativos esperados',
        tiempoPromedioVenta: parsed.tiempoPromedioVenta || '90 días',
        factoresInfluyentes: parsed.factoresInfluyentes || ['Condiciones económicas generales']
      };
    } catch (error) {
      console.error('Error en análisis de tendencia IA:', error);
      return {
        tendencia: 'estable',
        demanda: 'Media',
        prediccionCortoPlaza: 'Sin cambios significativos esperados',
        tiempoPromedioVenta: '90 días',
        factoresInfluyentes: ['Condiciones económicas generales']
      };
    }
  }
}

export const geminiClient = new GeminiClient();
