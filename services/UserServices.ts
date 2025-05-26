import generateHash from '../Helpers/generateHash';
import UserRepository from '../repositories/UserRepository';

import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';



class usuarioServi {
    
    static async register(Person: User) {
        Person.password = await generateHash(Person.password);
        return await UserRepository.createUser(Person);
    }

    static async login(login: Login) {
        return await UserRepository.searchUser(login);
    }
}

export default usuarioServi;