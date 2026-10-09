import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the Angular frontend (http://localhost:4200) can communicate with this API
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Request logger for easy debugging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount all API routes under the /api prefix
app.use('/api', apiRouter);

// Global fallback 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 MPloyChek Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Login API:   http://localhost:${PORT}/api/login`);
  console.log(`📋 Records API: http://localhost:${PORT}/api/records`);
  console.log(`👥 Users API:   http://localhost:${PORT}/api/users`);
  console.log(`===============================================`);
});
