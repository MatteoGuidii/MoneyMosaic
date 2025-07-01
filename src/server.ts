// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import createLinkToken from './routes/createLinkToken';
import exchangeToken from './routes/exchangeToken';
import sandboxRoutes from './routes/sandbox';
import transactionsRoutes from './routes/transactions';
import { database } from './database';
import { schedulerService } from './services/schedulerService';

dotenv.config();
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// Your API routes
app.use('/api', createLinkToken);
app.use('/api', exchangeToken);
app.use('/api', sandboxRoutes);
app.use('/api', transactionsRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  
  // Initialize database and start background jobs
  console.log('🗄️ Database initialized');
  
  // Start background jobs (sync every 6 hours by default)
  const syncHours = parseInt(process.env.SYNC_INTERVAL_HOURS || '6');
  schedulerService.startAll(syncHours);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down gracefully...');
  schedulerService.stopAll();
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Shutting down gracefully...');
  schedulerService.stopAll();
  database.close();
  process.exit(0);
});
