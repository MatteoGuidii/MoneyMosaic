// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import createLinkToken from './routes/createLinkToken';
import exchangeToken from './routes/exchangeToken';
import sandboxRoutes from './routes/sandbox';

dotenv.config();
const app = express();
app.use(express.json());

// ← Add this block:
app.get('/', (_req, res) => {
  res.send('🟢 FinTracker API is up and running!');
});

// Your API routes
app.use('/api', createLinkToken);
app.use('/api', exchangeToken);
app.use('/api', sandboxRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
