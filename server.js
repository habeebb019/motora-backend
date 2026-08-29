
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.get('/', (req,res) => res.json({ message: 'Motora Backend API is Running 🚀', db: 'Connected to Mumbai cluster' }));
app.get('/api/health', (req,res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use('/api/auth', require('./routes/auth'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
