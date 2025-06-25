
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

  // static async registerAgent(agent: Agent) {
  //   try {
  //     console.log("Agente recibido en servicio:", agent);
  //       agent.password = await generateHash(agent.password);
  //       return await UserRepository.CreateAgent(agent);
  //     } catch (error) {
  //         console.error('Error al registrar agente:', error);
  //       throw new Error('No se pudo registrar el agente');
  //     }
  // }

}

export default usuarioServi;
