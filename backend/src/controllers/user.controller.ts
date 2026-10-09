import { Request, Response } from 'express';
import { DbService } from '../services/db.service.js';
import { UserRole } from '../models/types.js';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const delayParam = req.query['delay'] as string | undefined;
    if (delayParam) {
      const delayMs = parseInt(delayParam, 10);
      if (!isNaN(delayMs) && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const users = await DbService.getUsers();
    const safeUsers = users.map(({ password: _, ...rest }) => rest);

    res.status(200).json({
      success: true,
      data: safeUsers,
    });
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    const { userId, password, name, role, department, email } = req.body;

    if (!userId || !password || !name || !role) {
      res.status(400).json({
        success: false,
        message: 'userId, password, name, and role are required.',
      });
      return;
    }

    if (role !== 'Admin' && role !== 'General User') {
      res.status(400).json({
        success: false,
        message: 'Role must be either "Admin" or "General User".',
      });
      return;
    }

    const existing = await DbService.findUserByUserId(userId);
    if (existing) {
      res.status(409).json({
        success: false,
        message: `User with ID '${userId}' already exists.`,
      });
      return;
    }

    const newUser = await DbService.addUser({
      userId,
      username: userId,
      password,
      name,
      role: role as UserRole,
      department: department || 'General',
      email: email || `${userId}@mploychek.io`,
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: safeUser,
    });
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, role, department, email, password } = req.body;

    const updates: Record<string, any> = {};
    if (name) updates['name'] = name;
    if (role) {
      if (role !== 'Admin' && role !== 'General User') {
        res.status(400).json({
          success: false,
          message: 'Role must be either "Admin" or "General User".',
        });
        return;
      }
      updates['role'] = role;
    }
    if (department) updates['department'] = department;
    if (email) updates['email'] = email;
    if (password) updates['password'] = password;

    const updatedUser = await DbService.updateUser(id, updates);
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: `User with ID '${id}' not found.`,
      });
      return;
    }

    const { password: _, ...safeUser } = updatedUser;
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: safeUser,
    });
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deleted = await DbService.deleteUser(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `User with ID '${id}' not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User '${id}' deleted successfully.`,
    });
  }
}
