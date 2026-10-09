import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { RecordController } from '../controllers/record.controller.js';
import { UserController } from '../controllers/user.controller.js';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'MPloyChek API', timestamp: new Date().toISOString() });
});

// Auth Routes (Login)
apiRouter.post('/login', AuthController.login);

// Verification Records Routes (with delay & role filtering)
apiRouter.get('/records', RecordController.getRecords);
apiRouter.put('/records/:id', RecordController.updateRecord);

// Admin User Management Routes (Full CRUD)
apiRouter.get('/users', UserController.getAllUsers);
apiRouter.post('/users', UserController.createUser);
apiRouter.put('/users/:id', UserController.updateUser);
apiRouter.delete('/users/:id', UserController.deleteUser);
