import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import counselorMeetingsRouter from './routes/counselorMeetings.js';
import ambassadorSlotsRouter from './routes/ambassadorSlots.js';
import chatsRouter from './routes/chats.js';
import eventsRouter from './routes/events.js';
import adminRouter from './routes/admin.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.frontendUrls.includes(origin) || origin === env.frontendUrl) return callback(null, true);
      callback(new Error('CORS blocked origin'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const prefix = env.apiPrefix ?? '/api/v1';
app.use(`${prefix}/auth`, authRouter);
app.use(`${prefix}/users`, usersRouter);
app.use(`${prefix}/counselor-meetings`, counselorMeetingsRouter);
app.use(`${prefix}/ambassador-slots`, ambassadorSlotsRouter);
app.use(`${prefix}/chats`, chatsRouter);
app.use(`${prefix}/events`, eventsRouter);
app.use(`${prefix}/admin`, adminRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const port = env.port;
const server = app.listen(port, () => {
  console.log(`PeerNXT API listening on port ${port} at ${prefix}`);
});
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Use a different port: set PORT=4001 (or run: PORT=4001 node dist/index.js).`);
    process.exit(1);
  }
  throw err;
});
