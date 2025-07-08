import { Request, Response } from 'express'
import visitService from '../services/visitAdminService'

const getAllVisits = async (req: Request, res: Response) => {
  try {
    const visits = await visitService.getAllVisits()
    res.status(200).json(visits)
  } catch (error) {
    console.error('Error al obtener visitas:', error)
    res.status(500).json({ message: 'Error al obtener visitas' })
  }
}

export default {
  getAllVisits
}