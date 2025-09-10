import AgentTokenRepository from '../repositories/agentTokenRepository';
import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import Agent from '../Dto/AgentsDto';

export default class AgentService {
  // RF03.1: Register agent using invitation token
  static async registerWithToken(data: {
    name_person: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    token: string;
  }) {
    try {
      // Check if the email is unique
      const emailAvailable = await UserRepository.verifySingleEmail(data.email);
      if (!emailAvailable) {
        throw new Error('Email is already registered');
      }

      // Validate the token and get the real estate ID
      const realEstateId = await AgentTokenRepository.validateToken(data.token);
      if (!realEstateId) {
        throw new Error('Invalid or expired token');
      }

      // Create agent instance
      const agent = new Agent(
        data.name_person,
        data.last_name,
        data.email,
        data.phone,
        data.password,
        realEstateId
      );

      // Save agent to database
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
      console.error('Error in registerWithToken:', error);
      throw error;
    }
  }

  // RF03.2: Agent requests to join manually
  static async requestJoin(data: {
    name_person: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    realEstateId: number;
  }) {
    const { name_person, last_name, email, phone, password, realEstateId } = data;

    if (!name_person || !last_name || !email || !phone || !password || !realEstateId) {
      throw new Error('All fields are required');
    }

    const hash = await bcrypt.hash(password, 10);
    await UserRepository.insertAgentJoinRequest(name_person, last_name, email, phone, hash, realEstateId);

    return { message: 'Join request sent successfully', success: true };
  }

  // RF03.3: List pending agent join requests
  static async listRequests() {
    return await UserRepository.listAgentJoinRequests();
  }

  // RF03.4: Approve a join request
  static async approveRequest(id: number) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.approveAgentJoinRequest(id);
    return { message: 'Request approved and agent registered', success: true };
  }

  // RF03.5: Reject a join request
  static async rejectRequest(id: number, justification?: string) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.rejectAgentJoinRequest(id, justification);
    return { message: 'Request rejected', success: true };
  }

  // RF03.6: Cancel a join request (by agent)
  static async cancelRequest(id: number) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid request ID');
    }

    await UserRepository.cancelAgentJoinRequest(id);
    return { message: 'Request canceled', success: true };
  }
}
