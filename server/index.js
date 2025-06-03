import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';  // Убедитесь, что импорт только один
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Middleware
import authMiddleware from './middleware/auth.js';

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express
const app = express();

// Security Middleware
app.use(helmet());
app.disable('x-powered-by');

app.use(cors({
  origin: 'http://localhost:3001', // Здесь укажите URL вашего фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10000,  // Max requests
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Database Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI не определен в .env файле');
        }

        console.log('Подключение к MongoDB с URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,  // Таймаут 10 секунд
        });
        console.log('✅ Успешное подключение к MongoDB');
    } catch (err) {
        console.error('❌ Ошибка подключения к MongoDB:', err.message);
        console.error('Причина:', err);
        process.exit(1);
    }
};

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', authMiddleware, profileRoutes);
app.use('/api/v1/cart', authMiddleware, cartRoutes);  // Защищенные маршруты для корзины
app.use('/api/v1/orders', authMiddleware, orderRoutes);

// Static Files
const staticDir = path.resolve(__dirname, '..', 'docs');
app.use(express.static(staticDir));

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Ошибка на сервере:', err);
    res.status(500).json({
        status: 'error',
        message: 'Произошла ошибка на сервере',
        ...(NODE_ENV === 'development' && { error: err.message, stack: err.stack }),  // Подробности ошибки в режиме разработки
    });
});

// Start Server
const server = createServer(app);

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на порту ${PORT}`);
        console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    });
};

startServer();

// Graceful Shutdown
const shutdown = () => {
    server.close(() => {
        console.log('Сервер завершил работу');
        mongoose.connection.close(() => {
            console.log('Подключение к MongoDB закрыто');
            process.exit(0);
        });
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
