"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const verticalRoutes_1 = __importDefault(require("./routes/verticalRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const attachmentRoutes_1 = __importDefault(require("./routes/attachmentRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const moduleRoutes_1 = __importDefault(require("./routes/moduleRoutes"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ==========================================
// Middleware
// ==========================================
// ALLOW ALL ORIGINS IN PRODUCTION FOR INITIAL SETUP, OR SPECIFY YOUR DOMAIN
app.set('etag', false);
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
// Prevent stale 304 caching on dynamic REST API calls
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});
// ==========================================
// Routes
// ==========================================
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Intellectual Paradise Services Backend is LIVE!',
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
app.use('/api/modules', moduleRoutes_1.default);
// Serve Static Uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ==========================================
// Initialize Server
// ==========================================
app.listen(PORT, async () => {
    console.log(`\n==========================================`);
    console.log(`🚀 IPS Server initialized on Port ${PORT}`);
    try {
        const client = await db_1.default.connect();
        console.log(`✅ Secure PostgreSQL Infrastructure Online!`);
        client.release();
    }
    catch (err) {
        console.error(`❌ Database Connection Failed:`, err.message);
    }
    console.log(`🔌 API Gateway Ready`);
    console.log(`==========================================\n`);
});
