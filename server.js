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

try { app.use('/api/auth', require('./auth')); } catch(e){ console.log('auth err', e.message); }
try { app.use('/api/listings', require('./listings')); } catch(e){ console.log('listings err', e.message); }
try { app.use('/api/bookings', require('./bookings')); } catch(e){ console.log('bookings err', e.message); }
try { app.use('/api/admin', require('./admin')); } catch(e){ console.log('admin err', e.message); }
try { app.use('/api/users', require('./users')); } catch(e){ console.log('users err', e.message); }
try { app.use('/api/wallet', require('./wallet')); } catch(e){ console.log('wallet err', e.message); }

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, '0.0.0.0', () => console.log('Running on ' + PORT));
  })
  .catch(err => {
    console.error('MongoDB Failed:', err.message);
    app.listen(PORT, '0.0.0.0', () => console.log('Running WITHOUT DB on ' + PORT));
  });
