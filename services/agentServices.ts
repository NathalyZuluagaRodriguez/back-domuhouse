import AgentTokenRepository from '../repositories/agentTokenRepository';
import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import Agent from '../Dto/AgentsDto';

export default class AgentService {
  // RF03.1: Register agent with invitation token
  static async registerWithToken(data: {
    name_person: string,
    last_name: string,
    email: string,
    phone: string,
    password: string,
    token: string
  }) {
    try {
      // Check if email is unique
      const emailAvailable = await UserRepository.Verifysingleemail(data.email);
      if (!emailAvailable) {
        throw new Error('Email is already registered');
      }

      // Validate the token and get real estate ID
      const realEstateId = await AgentTokenRepository.validateToken(data.token);
      if (!realEstateId) {
        throw new Error('Invalid or used token');
      }

      // Create an instance of Agent with validated data
      const agent = new Agent(
        data.name_person,
        data.last_name,
        data.email,
        data.phone,
        data.password,
        realEstateId
      );

      // Register the agent in the database
      await AgentTokenRepository.createAgentWithToken(
        agent.name_person,
        agent.last_name,
        agent.email,
        agent.phone,
        agent.password,
        agent.realEstateId
      );

      // Mark token as used
      await AgentTokenRepository.markTokenUsed(data.token);

      return {
        message: 'Agent registered successfully',
        success: true,
        data: {
          name_person: agent.name_person,
          email: agent.email,
          realEstateId: agent.realEstateId
        }
      };
    } catch (error: any) {
      console.error('Error in AgentService.registerWithToken:', error);
      throw error;
    }
  }

  // RF03.2: Agent request to join
  static async requestJoin(data: any) {
    const { name_person, last_name, email, phone, password, realEstateId } = data;

    if (!name_person || !last_name || !email || !phone || !password || !realEstateId) {
      throw new Error('All fields are required');
    }

    const hash = await bcrypt.hash(password, 10);
    await UserRepository.insertSolicitud(name_person, last_name, email, phone, hash, realEstateId);

    return { message: 'Join request sent successfully', success: true };
  }

  // RF03.3: List pending join requests
  static async listRequests() {
    return await UserRepository.listSolicitudes();
  }

  static async approveRequest(id: number) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.approveSolicitud(id);
    return { message: 'Request approved and agent registered', success: true };
  }

  // RF03.4: Reject request
  static async rejectRequest(id: number, justification?: string) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.rejectSolicitud(id, justification);
    return { message: 'Request rejected', success: true };
  }

  static async cancelRequest(id: number) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.cancelSolicitud(id);
    return { message: 'Request canceled', success: true };
  }
}
