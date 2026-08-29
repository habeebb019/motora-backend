
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect, checkRole } = require('../middleware/auth');

// Super Admin seed - create on first run if not exists
router.post('/seed-superadmin', async (req,res) => {
  const exists = await Admin.findOne({ username: 'superadmin' });
  if(exists) return res.json({ message: 'Super Admin already exists' });
  const admin = await Admin.create({
    username: 'superadmin',
    email: 'superadmin@motora.com',
    password: 'superadmin123',
    role: 'super_admin'
  });
  res.json({ message: 'Super Admin created', username: 'superadmin', password: 'superadmin123' });
});

// Login
router.post('/login', async (req,res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if(!admin) return res.status(404).json({ message: 'Admin not found' });
  const match = await admin.comparePassword(password);
  if(!match) return res.status(401).json({ message: 'Wrong password' });
  const token = jwt.sign({ id: admin._id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.json({ token, admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
});

// Create normal admin - ONLY SUPER ADMIN
router.post('/create', protect, checkRole('super_admin'), async (req,res) => {
  const { username, email, password, role } = req.body;
  if(role === 'super_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only Super Admin can create another Super Admin' });
  }
  const admin = await Admin.create({ username, email, password, role: role || 'admin', createdBy: req.user.id });
  res.json({ message: 'Admin created', admin });
});

// List admins - ONLY SUPER ADMIN
router.get('/', protect, checkRole('super_admin'), async (req,res) => {
  const admins = await Admin.find().select('-password');
  res.json(admins);
});

module.exports = router;
