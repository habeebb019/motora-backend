
const express = require('express');
const router = express.Router();
const User = require('./User');
const protect = (req, res, next) => { req.user = { id: 'test' }; next(); };
const checkRole = () => (req, res, next) => next();

router.get('/owners', protect, checkRole('super_admin','admin'), async (req,res) => {
  const owners = await User.find({ roles: 'owner' });
  res.json(owners);
});

router.get('/renters', protect, checkRole('super_admin','admin'), async (req,res) => {
  const renters = await User.find({ roles: 'renter' });
  res.json(renters);
});

module.exports = router;
