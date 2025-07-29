
// File: server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

