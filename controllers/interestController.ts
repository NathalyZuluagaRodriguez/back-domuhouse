import { Request, Response } from "express"
import InterestService from "../services/interestServices"

export const getAllInterests = async (_: Request, res: Response) => {
  try {
    const data = await InterestService.listInterests()
    res.json(data)
  } catch (e) {
    console.error("Error en getAllInterests:", e)  // 👈 ESTE ES IMPORTANTE
    res.status(500).json({ error: "Error retrieving interests" })
  }
}


export const updateInterestStatus = async (req: Request, res: Response) => {
  try {
    const idInterest = parseInt(req.params.idInterest)
    const { newStatus, agentId } = req.body

    if (!newStatus || !agentId) {
      return res.status(400).json({ error: "Missing status or agent ID" })
    }

    await InterestService.updateInterestStatus(idInterest, newStatus, agentId)
    res.json({ message: "Interest status updated" })

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Unexpected error" })
    }
  }
}

