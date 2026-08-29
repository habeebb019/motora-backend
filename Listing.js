
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  area: String,
  address: String,
  type: { type: String, enum: ['Covered','Open','Garage','CCTV','EV Charging'], default: 'Covered' },
  size: { type: String, enum: ['Small','Medium','Large'], default: 'Medium' },
  priceDaily: Number,
  priceWeekly: Number,
  priceMonthly: Number,
  photos: [String],
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
