const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes   = require('./routes/auth');
const folderRoutes = require('./routes/folders');
const imageRoutes  = require('./routes/images');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<password>') || uri.includes('<db_password>')) {
    throw new Error('MONGO_URI is missing or has placeholder value');
  }
  const db = await mongoose.connect(uri);
  isConnected = db.connections[0].readyState === 1;
  console.log('Connected to MongoDB');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ message: 'Database unavailable', detail: err.message });
  }
});

app.use('/api/auth',    authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/images',  imageRoutes);
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }));

app.get('/api/debug', (req, res) => {
  res.json({
    node: process.version,
    env_mongo: process.env.MONGO_URI ? 'SET' : 'MISSING',
    env_jwt: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    env_cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
    env_cloudinary_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
    env_cloudinary_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
    mongoose_state: mongoose.connection.readyState,
    isConnected,
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;