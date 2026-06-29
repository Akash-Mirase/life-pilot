require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/error');
const { ensureDemo } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://lifepilot-ai.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV,
  ai: !!process.env.GEMINI_API_KEY,
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString(),
}));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error handlers ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Database & Start ──────────────────────────────────────────────────────
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not set. Please configure your .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');

    // Seed demo user
    await ensureDemo();

    app.listen(PORT, () => {
      console.log(`\n🚀 LifePilot AI Server running on port ${PORT}`);
      console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   AI:  ${process.env.GEMINI_API_KEY ? '✅ Gemini configured' : '⚠️  GEMINI_API_KEY missing'}`);
      console.log(`   DB:  ✅ MongoDB Atlas\n`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
