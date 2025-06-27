
import generateHash from '../Helpers/generateHash';
import UserRepository from '../repositories/UserRepository';
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';
import Agent from '../Dto/AgentsDto';


class usuarioServi {
    
  static async register(user: User) {
      user.password = await generateHash(user.password);
      return await UserRepository.createUser(user);
  }

  static async login(login: Login) {
      return await UserRepository.searchUser(login);
  }



}

export default usuarioServi;
