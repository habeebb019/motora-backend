
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  type: { type: String, enum: ['platform_fee','withdrawal'], required: true },
  amount: Number,
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  note: String
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletSchema);
