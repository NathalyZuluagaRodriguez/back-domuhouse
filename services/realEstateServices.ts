import realEstateRepo from "../repositories/realEstatesRepositorys";
import { sendRealEstateConfirmationEmail } from "../utils/sendEmailer"; 

// Interface de inmobiliaria
interface NewRealEstate {
    name_realestate: string;
    nit: string;
    phone: string;
    email: string;
    num_properties: number;
    department: string;
    city: string;
    address: string;
    description: string;
    person_id: number;
    logo_url?: string; 
}

const registerRealEstate = async (data: NewRealEstate) => {
    try {
        console.log('🔍 Datos recibidos en servicio:', data); // ✅ Debug
        
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

        // ✅ Pasar logo_url al repositorio
        const created = await realEstateRepo.createRealEstate({
            ...data,
            logo_url: data.logo_url // ✅ Asegurar que se pase logo_url
        });
        
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

        console.log('✅ Inmobiliaria registrada con logo_url:', data.logo_url); // ✅ Debug

        return true;
    } catch (error: any) {
        console.error('❌ Error en servicio:', error); // ✅ Debug
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