// src/server.ts
import express from 'express';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';
import createLinkToken from './routes/link-token';
import exchangeToken from './routes/token-exchange';
import sandboxRoutes from './routes/sandbox';
import transactionsRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import syncRoutes from './routes/sync';
import { database } from './database';
import { schedulerService } from './services/scheduler.service';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './swagger';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve React app build files with correct paths
app.use('/dist', express.static(path.join(__dirname, '../public/dist')));
app.use('/assets', express.static(path.join(__dirname, '../public/dist/assets')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: config.server.environment
  });
});

// API routes with consistent naming
app.use('/api', createLinkToken);
app.use('/api', exchangeToken);
app.use('/api', sandboxRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/sync', syncRoutes);

// Error handling middleware
app.use(errorHandler);

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server listening on http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${config.server.environment}`);
  
  // Initialize database and start background jobs
  logger.info('🗄️ Database initialized');
  
  // Start background jobs
  const syncHours = config.scheduler.syncIntervalHours;
  schedulerService.startAll(syncHours);
  logger.info(`⏰ Background jobs started (sync every ${syncHours} hours)`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`\n⏹️ Received ${signal}, shutting down gracefully...`);
  schedulerService.stopAll();
  database.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
