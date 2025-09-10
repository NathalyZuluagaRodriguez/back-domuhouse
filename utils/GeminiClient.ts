// Reemplaza TODO el contenido actual por esto
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ICaracteristicaInmueble, IEstimacionPrecio, ITendenciaMercado, ErrorResponse,} from '../models/interfaces';
import {IMercadoData} from '../services/iaService';

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
Tu única tarea es extraer información sobre propiedades inmobiliarias (casas, apartamentos, terrenos, etc.).
Ignora cualquier texto que no tenga relación con este contexto. 

Si el texto es irrelevante (como preguntas, saludos, temas no inmobiliarios, etc), responde exactamente este JSON:
{
  "error": "Solo respondo análisis de propiedades. Por favor, proporciona una descripción válida."
}

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

    // ✅ Si se recibe el JSON de error, lo retornamos tal cual
    if (parsed.error) {
      return { message: parsed.error };
    }

    // ✅ Validación básica del contenido esperado
    if (!parsed.tipoPropiedad || !parsed.habitaciones || !parsed.banos || !parsed.metrosCuadrados) {
      return { message: 'La descripción no contiene información suficiente sobre un inmueble válido.' };
    }

    return {
      tipoPropiedad: parsed.tipoPropiedad,
      habitaciones: Number(parsed.habitaciones),
      banos: Number(parsed.banos),
      metrosCuadrados: Number(parsed.metrosCuadrados),
      garaje: parsed.garaje === true || parsed.garaje === 'true',
      piscina: parsed.piscina === true || parsed.piscina === 'true',
      jardin: parsed.jardin === true || parsed.jardin === 'true',
      terraza: parsed.terraza === true || parsed.terraza === 'true',
      ubicacion: parsed.ubicacion || 'No especificado',
      antiguedad: Number(parsed.antiguedad) || 0,
      estrato: Number(parsed.estrato) || 0
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error inesperado al procesar la descripción';
    return { message: errorMsg };
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
  async estimarPrecio(
  caracteristicas: ICaracteristicaInmueble,
  datosZona: IMercadoData
): Promise<IEstimacionPrecio | ErrorResponse> {
  try {
    const prompt = `Eres un asistente experto en análisis inmobiliario en Colombia.

Con base en las características del inmueble y los datos del mercado de la zona, debes estimar el precio justo del inmueble. 
El precio debe ser un número en pesos colombianos (COP), sin símbolos, sin separadores de miles, sin texto adicional. 
Tu respuesta debe ser SOLO el número, estrictamente.

### Características del inmueble:
- Tipo de propiedad: ${caracteristicas.tipoPropiedad}
- Habitaciones: ${caracteristicas.habitaciones}
- Baños: ${caracteristicas.banos}
- Metros cuadrados: ${caracteristicas.metrosCuadrados}
- Garaje: ${caracteristicas.garaje ? 'Sí' : 'No'}
- Piscina: ${caracteristicas.piscina ? 'Sí' : 'No'}
- Jardín: ${caracteristicas.jardin ? 'Sí' : 'No'}
- Terraza: ${caracteristicas.terraza ? 'Sí' : 'No'}
- Antigüedad: ${caracteristicas.antiguedad ?? 0} años
- Estrato: ${caracteristicas.estrato ?? 'No especificado'}

### Datos del mercado en la zona:
- Zona: ${datosZona.zona}
- Precio promedio: ${datosZona.precioPromedio}
- Precio mínimo: ${datosZona.precioMinimo}
- Precio máximo: ${datosZona.precioMaximo}
- Metros cuadrados promedio: ${datosZona.metrosCuadradosPromedio}
- Oferta disponible: ${datosZona.ofertaDisponible}
- Tendencia: ${datosZona.tendencia}

Estima un precio de venta justo para esta propiedad. Solo responde con el número.`;

    const result = await this.model.generateContent(prompt);
    const rawText = result.response.text();

    const match = rawText.replace(/,/g, '').match(/\d+/);
    if (!match) {
      return { message: 'La IA no pudo estimar un precio válido.' };
    }

    const precioEstimado = Number(match[0]);
    if (isNaN(precioEstimado)) {
      return { message: 'La IA devolvió un valor no numérico.' };
    }

    // Devolver estructura completa compatible con IEstimacionPrecio
    return {
      precioEstimado,
      rangoMinimo: precioEstimado * 0.9,
      rangoMaximo: precioEstimado * 1.1,
      moneda: 'COP',
      factoresConsiderados: {
        precioBaseMercado: datosZona.precioPromedio,
        ajustesPorCaracteristicas: precioEstimado - datosZona.precioPromedio,
      },
      confianzaPrediccion: 0.85,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error inesperado al estimar el precio';
    return { message: errorMsg };
  }
}

}

export const geminiClient = new GeminiClient();