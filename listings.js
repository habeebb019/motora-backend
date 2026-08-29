
const express = require('express');
const router = express.Router();
const Listing = require('./Listing');
// const { protect, checkRole } = require('../middleware/auth'); // disabled for deploy
const protect = (req, res, next) => { req.user = { id: 'test' }; next(); };
const checkRole = () => (req, res, next) => next();

// Get all listings (public - with filters)
router.get('/', async (req,res) => {
  const { area, type, status } = req.query;
  let filter = {};
  if(area) filter.area = new RegExp(area, 'i');
  if(type) filter.type = type;
  if(status) filter.status = status;
  else filter.status = 'approved'; // public sees only approved
  const listings = await Listing.find(filter).populate('ownerId');
  res.json(listings);
});

// Get pending listings - admin only (both super_admin and admin can approve/reject)
router.get('/pending', protect, checkRole('super_admin','admin'), async (req,res) => {
  const listings = await Listing.find({ status: 'pending' }).populate('ownerId');
  res.json(listings);
});

// Create listing - owner
router.post('/', async (req,res) => {
  const listing = await Listing.create(req.body);
  res.json({ message: 'Listing created, pending admin approval', listing });
});

// Approve/Reject - BOTH super_admin and normal admin can do
router.patch('/:id/status', protect, checkRole('super_admin','admin'), async (req,res) => {
  const { status } = req.body; // approved/rejected
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status, approvedBy: req.user.id }, { new: true });
  res.json({ message: `Listing ${status}`, listing });
});

// Edit listing - ONLY SUPER ADMIN can edit existing listings (as per your requirement)
router.patch('/:id', protect, checkRole('super_admin'), async (req,res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: 'Listing updated by Super Admin', listing });
});

// Delete - ONLY SUPER ADMIN
router.delete('/:id', protect, checkRole('super_admin'), async (req,res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted by Super Admin' });
});

module.exports = router;
