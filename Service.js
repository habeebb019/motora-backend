
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleType: String,
  vehicleModel: String,
  serviceType: String,
  description: String,
  location: String,
  status: { type: String, default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Service', serviceSchema);
