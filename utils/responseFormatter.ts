import { Response } from 'express';

interface ApiResponse {
  status: string;
  message: string;
  data: any;
}

export const success = (res: Response, data: any, message: string = '', statusCode: number = 200): Response => {
  const responseBody: ApiResponse = {
    status: 'success',
    message,
    data
  };
  
  return res.status(statusCode).json(responseBody);
};

export const error = (res: Response, message: string = 'Error en el servidor', statusCode: number = 500): Response => {
  const responseBody: ApiResponse = {
    status: 'error',
    message,
    data: null
  };
  
  return res.status(statusCode).json(responseBody);
};