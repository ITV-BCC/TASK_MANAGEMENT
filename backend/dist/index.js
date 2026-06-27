"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST before anything else
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const verticalRoutes_1 = __importDefault(require("./routes/verticalRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const attachmentRoutes_1 = __importDefault(require("./routes/attachmentRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ==========================================
// Middleware
// ==========================================
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both Vite ports
    credentials: true
}));
app.use(express_1.default.json());
// ==========================================
// Routes
// ==========================================
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Task Management Backend is running properly!',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/verticals', verticalRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.use('/api/attachments', attachmentRoutes_1.default);
app.use('/api/comments', commentRoutes_1.default);
// Serve Static Uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ==========================================
// Initialize Server and check Database
// ==========================================
app.listen(PORT, async () => {
    console.log(`\n==========================================`);
    console.log(`🚀 Server initialized on http://localhost:${PORT}`);
    try {
        const client = await db_1.default.connect();
        console.log(`✅ Successfully connected to PostgreSQL Database!`);
        client.release();
    }
    catch (err) {
        console.error(`❌ Failed to connect to Database. Check your .env file.`, err);
    }
    console.log(`🔌 Ready to handle API requests`);
    console.log(`==========================================\n`);
});
