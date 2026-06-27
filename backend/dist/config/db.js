"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration for Secure Cloud / Local connection
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // VERY IMPORTANT for Supabase/Cloud connections:
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});
// Test Connection Immediately
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Database Initialization Failed:', err.stack);
    }
    console.log('✅ Connected to Secure PostgreSQL Infrastructure');
    release();
});
exports.default = pool;
