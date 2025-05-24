
import generateHash from '../Helpers/generateHash';
import UserRepository from '../repositories/UserRepository';
import User from '../Dto/UserDto';
import Login from '../Dto/loginDto';
import Agent from '../Dto/AgentsDto';


class usuarioServi {
    
    static async register(usuario: User) {
        usuario.password = await generateHash(usuario.password);
        return await UserRepository.createUsuario(usuario);
    }

    static async login(login: Login) {
        return await UserRepository.buscarUsuario(login);
    }

   static async registerAgent(agent: Agent) {
        try {
          console.log("Agente recibido en servicio:", agent);
          agent.password = await generateHash(agent.password);
          return await UserRepository.createAgente(agent);
        } catch (error) {
          console.error('Error al registrar agente:', error);
          throw new Error('No se pudo registrar el agente');
        }
      }

}

export default usuarioServi;
