import { Request, Response } from "express";
import realEstateServices from "../services/realEstateServices";

const registerRealEstate = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        const fields = ["name", "nit", "phone", "email", "department", "num_properties", "city", "adress", "description", "person_id"];
        for (const field of fields) {
            if (!data[field]) {
                return res.status(400).json({ message: `Missing field: ${field}` });
            }
        }

        await realEstateServices.registerRealEstate(data);
        res.status(201).json({ message: "Real estate registered successfully." });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export default registerRealEstate;