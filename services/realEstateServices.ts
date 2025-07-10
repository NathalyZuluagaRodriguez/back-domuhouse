// ===== SERVICIO (realEstateServices.ts) =====
import realEstateRepo from "../repositories/realEstatesRepositorys";
import { sendRealEstateConfirmationEmail } from "../utils/sendEmailer"; 

// Interface de inmobiliaria
interface NewRealEstate {
    name_realestate: string,
    nit: string,
    phone: string,
    email: string,
    department: string,
    city: string;
    adress: string;
    description: string;
    person_id: number;
    logo_url?: string;
}

const registerRealEstate = async (data: NewRealEstate) => {
    try {
        const personExists = await realEstateRepo.personExists(data.person_id);
        if (!personExists) {
            throw new Error("The person_id is not registered in the database");
        }

        const isAlreadyAdmin = await realEstateRepo.checkIfAlreadyAdmin(data.person_id);
        if (isAlreadyAdmin) {
            throw new Error("You are already registered as an admin of a real estate");
        }

        const exists = await realEstateRepo.findByNameOrEmail(data.name_realestate, data.email);
        if (exists) {
            throw new Error("A real estate with this name or email already exists");
        }

        const created = await realEstateRepo.createRealEstate(data);
        if (!created) {
            throw new Error("Error registering the real estate");
        }

        const adminEmail = await realEstateRepo.getPersonEmail(data.person_id);
        if (adminEmail) {
            await sendRealEstateConfirmationEmail(
                adminEmail,
                data.name_realestate
            );
        }

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const fetchAllRealEstates = async (): Promise<any[]> => {
    return await realEstateRepo.getAllRealEstates();
};

export const getRealEstateStatistics = async () => {
    return await realEstateRepo.getRealEstateStats();
};



export default {
    registerRealEstate,
    fetchAllRealEstates,
    getRealEstateStatistics,
};
