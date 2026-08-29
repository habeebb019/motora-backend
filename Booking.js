
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, default: () => 'MO' + Date.now() + Math.floor(Math.random()*1000) },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromDate: Date,
  toDate: Date,
  totalDays: Number,
  carNumber: { type: String, required: true },
  totalAmount: Number,
  platformFee: Number, // 10%
  ownerEarning: Number, // 90%
  paymentStatus: { type: String, enum: ['Pending','Done'], default: 'Pending' },
  approvalStatus: { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  qrCode: String,
  razorpayPaymentId: String
}, { timestamps: true });

// Prevent same car overlapping - handled in route with query check
bookingSchema.index({ carNumber: 1, fromDate: 1, toDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
