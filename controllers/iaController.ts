import { Request, Response } from 'express';
import * as iaService from '../services/iaService';
import * as responseFormatter from '../utils/responseFormatter';

export const procesarInmueble = async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion, ubicacion, caracteristicas } = req.body;
    
    // Validaciones básicas
    if (!descripcion) {
      responseFormatter.error(res, 'Se requiere una descripción del inmueble', 400);
      return;
    }
    
    // Procesamiento del inmueble con IA (sin guardarlo en BD)
    const resultado = await iaService.analizarInmueble(descripcion, ubicacion, caracteristicas);
    
    responseFormatter.success(res, resultado, 'Análisis de inmueble exitoso', 200);
  } catch (error) {
    console.error('Error al procesar inmueble:', error);
    responseFormatter.error(res, 'Error en el procesamiento del inmueble', 500);
  }
};

export const obtenerFiltros = async (_req: Request, res: Response): Promise<void> => {
  try {
    const filtros = await iaService.obtenerFiltrosDisponibles();
    responseFormatter.success(res, filtros, 'Filtros obtenidos correctamente', 200);
  } catch (error) {
    console.error('Error al obtener filtros:', error);
    responseFormatter.error(res, 'Error al obtener los filtros disponibles', 500);
  }
};

export const obtenerDatosMercado = async (req: Request, res: Response): Promise<void> => {
  try {
    const zona = req.query.zona as string;
    const tipoPropiedad = req.query.tipoPropiedad as string;
    
    if (!zona || !tipoPropiedad) {
      responseFormatter.error(res, 'Se requieren los parámetros zona y tipoPropiedad', 400);
      return;
    }
    
    const datosMercado = await iaService.obtenerEstadisticasMercado(zona, tipoPropiedad);
    responseFormatter.success(res, datosMercado, 'Datos del mercado obtenidos correctamente', 200);
  } catch (error) {
    console.error('Error al obtener datos del mercado:', error);
    responseFormatter.error(res, 'Error al obtener datos del mercado inmobiliario', 500);
  }
};

export const analizarTendenciasAvanzado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zona, tipoPropiedad, factoresAdicionales } = req.body;
    
    if (!zona || !tipoPropiedad) {
      responseFormatter.error(res, 'Se requiere zona y tipo de propiedad para el análisis', 400);
      return;
    }
    
    const resultado = await iaService.analizarTendenciasMercado(zona, tipoPropiedad, factoresAdicionales);
    responseFormatter.success(res, resultado, 'Análisis de tendencias de mercado exitoso', 200);
  } catch (error) {
    console.error('Error al analizar tendencias de mercado:', error);
    responseFormatter.error(res, 'Error en el análisis de tendencias de mercado', 500);
  }
};