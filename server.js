const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Motora Backend LIVE', time: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

try { app.use('/api/auth', require('./auth')); } catch(e){}
try { app.use('/api/listings', require('./listings')); } catch(e){}
try { app.use('/api/bookings', require('./bookings')); } catch(e){}
try { app.use('/api/admin', require('./admin')); } catch(e){}
try { app.use('/api/users', require('./users')); } catch(e){}
try { app.use('/api/wallet', require('./wallet')); } catch(e){}

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB Failed:', err.message);
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running without DB on ${PORT}`));
  });
