import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import verticalRoutes from './routes/verticalRoutes';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import statsRoutes from './routes/statsRoutes';
import attachmentRoutes from './routes/attachmentRoutes';
import commentRoutes from './routes/commentRoutes';
import path from 'path';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================
// ALLOW ALL ORIGINS IN PRODUCTION FOR INITIAL SETUP, OR SPECIFY YOUR DOMAIN
app.use(cors({
    origin: '*', 
    credentials: true
}));
app.use(express.json());

// ==========================================
// Routes
// ==========================================
app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: '🚀 Intellectual Paradise Services Backend is LIVE!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/verticals', verticalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/comments', commentRoutes);

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// Initialize Server
// ==========================================
app.listen(PORT, async () => {
    console.log(`\n==========================================`);
    console.log(`🚀 IPS Server initialized on Port ${PORT}`);

    try {
        const client = await pool.connect();
        console.log(`✅ Secure PostgreSQL Infrastructure Online!`);
        client.release();
    } catch (err: any) {
        console.error(`❌ Database Connection Failed:`, err.message);
    }

    console.log(`🔌 API Gateway Ready`);
    console.log(`==========================================\n`);
});
