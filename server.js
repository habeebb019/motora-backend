const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Motora Backend LIVE 🚀', status: 'OK', time: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected' });
});

// Routes
try {
  app.use('/api/auth', require('./auth'));
} catch(e) {
  console.log('Auth routes not loaded:', e.message);
}

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected to Motora DB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} and host 0.0.0.0`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Failed:', err.message);
    // Still start server to show error in logs
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running WITHOUT DB on port ${PORT}`);
    });
  });
