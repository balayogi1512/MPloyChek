import { Request, Response } from 'express';
import { DbService } from '../services/db.service.js';
import { LoginRequest, LoginResponse } from '../models/types.js';

export class AuthController {
  static async login(req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>): Promise<void> {
    const { userId, password, role } = req.body;

    if (!userId || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'User ID, Password, and Role are all required.',
      });
      return;
    }

    const user = await DbService.findUserByUserId(userId);

    if (!user || user.password !== password) {
      res.status(401).json({
        success: false,
        message: 'Invalid User ID or Password.',
      });
      return;
    }

    if (user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Account role mismatch. You are registered as '${user.role}', not '${role}'.`,
      });
      return;
    }

    const { password: _, ...userProfile } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: userProfile,
      token: `mploychek-session-${user.id}-${Date.now()}`,
    });
  }
}
