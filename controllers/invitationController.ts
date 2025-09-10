// controllers/invitationController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { saveInvitationToken } from '../repositories/invitacionRepository';
import { sendInvitationEmail } from '../utils/sendEmailer';

export const generateInvitation = async (req: Request, res: Response) => {
  const { recipient_email, realEstateId  } = req.body;

  try {
    const token = jwt.sign({ recipient_email }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });

    // Save token in the database
    await saveInvitationToken(token, recipient_email, realEstateId);
    await sendInvitationEmail(recipient_email, token);

    return res.status(200).json({
      message: 'Invitation token generated and saved successfully',
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error generating the token',
      error: (error as Error).message,
    });
  }
};
