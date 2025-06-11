import realEstateRepo from "../repositories/realEstatesRepositorys";
import sendEmail from "../utils/sendEmailer"; 

//interface de inmobiliaria
interface NewRealEstate {
    name: string,
    nit: string,
    phone: string,
    email: string,
    num_properties: number,
    department: string,
    city: string;
    adress: string,
    description: string,
    person_id: number
}

const registerRealEstate = async (data: NewRealEstate) => {
    try {
        const personExists = await realEstateRepo.personExists(data.person_id);
        if (!personExists) {
            throw new Error("The person_id is not registered in the database");
        }

        // RF05.5: Validate if already an admin
        const isAlreadyAdmin = await realEstateRepo.checkIfAlreadyAdmin(data.person_id);
        if (isAlreadyAdmin) {
            throw new Error("You are already registered as an admin of a real estate");
        }

        // RF05.2: Validate duplicate name/email
        const exists = await realEstateRepo.findByNameOrEmail(data.name, data.email);
        if (exists) {
            throw new Error("A real estate with this name or email already exists");
        }

        // RF05.4: Insert real estate with person_id as main admin
        const created = await realEstateRepo.createRealEstate(data);
        if (!created) {
            throw new Error("Error registering the real estate");
        }

        const adminEmail = await realEstateRepo.getPersonEmail(data.person_id);
        if (adminEmail) {
            await sendEmail(
                adminEmail,
                "Successful Real Estate Registration",
                `Hello! Your real estate "${data.name}" has been successfully registered. 
                 You are now the main admin. You can log in to manage your properties, agents, and more.`
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
    getRealEstateStatistics
};