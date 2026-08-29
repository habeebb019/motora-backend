
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const WalletTransaction = require('../models/WalletTransaction');
const { protect, checkRole } = require('../middleware/auth');
const QRCode = require('qrcode');

// Create booking - check car overlapping globally
router.post('/', async (req,res) => {
  const { listingId, renterId, ownerId, fromDate, toDate, carNumber, totalAmount } = req.body;
  
  // Global car uniqueness check for overlapping dates
  const overlapping = await Booking.findOne({
    carNumber: carNumber.toUpperCase(),
    approvalStatus: { $ne: 'Rejected' },
    $or: [
      { fromDate: { $lte: new Date(toDate) }, toDate: { $gte: new Date(fromDate) } }
    ]
  });
  
  if(overlapping) {
    return res.status(400).json({ 
      message: `Car ${carNumber} already has a booking overlapping with these dates. Same car cannot be double-booked.`,
      overlappingBooking: overlapping.bookingId
    });
  }

  const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000*60*60*24)) + 1;
  const platformFee = Math.round(totalAmount * 0.10);
  const ownerEarning = totalAmount - platformFee;

  const booking = await Booking.create({
    listingId, renterId, ownerId, fromDate, toDate, totalDays: days,
    carNumber: carNumber.toUpperCase(),
    totalAmount, platformFee, ownerEarning,
    paymentStatus: 'Pending',
    approvalStatus: 'Pending'
  });

  res.json({ message: 'Booking Request Sent! Details sent to owner for approval', booking });
});

// Owner approves -> generate QR + platform fee transaction
router.patch('/:id/approve', async (req,res) => {
  const booking = await Booking.findById(req.params.id);
  if(!booking) return res.status(404).json({ message: 'Booking not found' });

  const qrData = `Motora Booking:${booking.bookingId}|Car:${booking.carNumber}|From:${booking.fromDate}|To:${booking.toDate}`;
  const qrCode = await QRCode.toDataURL(qrData);

  booking.approvalStatus = 'Approved';
  booking.paymentStatus = 'Done';
  booking.qrCode = qrCode;
  await booking.save();

  // Create platform fee wallet transaction (10% goes to Motora)
  await WalletTransaction.create({
    type: 'platform_fee',
    amount: booking.platformFee,
    bookingId: booking._id,
    note: `Platform fee from booking ${booking.bookingId}`
  });

  res.json({ message: 'Booking approved, QR generated, commission added to Motora wallet', booking });
});

router.get('/my/:userId', async (req,res) => {
  const bookings = await Booking.find({ $or: [{ renterId: req.params.userId }, { ownerId: req.params.userId }] }).populate('listingId');
  res.json(bookings);
});

router.get('/', protect, checkRole('super_admin','admin'), async (req,res) => {
  const bookings = await Booking.find().populate('listingId renterId ownerId').sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = router;
