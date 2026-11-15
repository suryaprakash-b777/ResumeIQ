/**
 * AI Analyzer & ResumeIQ Main Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Import Middlewares
const { generalLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const textRoutes = require('./routes/textRoutes');
const imageRoutes = require('./routes/imageRoutes');
const codeRoutes = require('./routes/codeRoutes');
const dataRoutes = require('./routes/dataRoutes');
const generalRoutes = require('./routes/generalRoutes');
const historyRoutes = require('./routes/historyRoutes');
const { ROLE_TEMPLATES } = require('./utils/roleTemplates');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter
app.use('/api', generalLimiter);

// Static uploads directory (secured, read-only)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Analyzer & ResumeIQ Backend API is operational.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Roles endpoint for frontend dropdowns
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await prisma.roleTemplate.findMany();
    if (roles.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Role templates retrieved.',
        data: roles.map(r => ({
          ...r,
          requiredSkills: typeof r.requiredSkills === 'string' ? JSON.parse(r.requiredSkills) : r.requiredSkills,
          preferredSkills: typeof r.preferredSkills === 'string' ? JSON.parse(r.preferredSkills) : r.preferredSkills
        }))
      });
    }
    // Fallback to in-memory templates if not yet seeded
    res.status(200).json({
      success: true,
      message: 'Role templates retrieved from memory.',
      data: ROLE_TEMPLATES
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      message: 'Role templates retrieved from memory.',
      data: ROLE_TEMPLATES
    });
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resumes', resumeRoutes); // alias
app.use('/api/analysis', analysisRoutes);
app.use('/api/text', textRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/history', historyRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server initialization
const server = app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`🚀 AI Analyzer & ResumeIQ Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📑 Health: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server stopped gracefully.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server terminated.');
    process.exit(0);
  });
});

