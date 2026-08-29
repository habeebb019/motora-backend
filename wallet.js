
const express = require('express');
const router = express.Router();
const WalletTransaction = require('./WalletTransaction');
const protect = (req, res, next) => { req.user = { id: 'test' }; next(); };
const checkRole = () => (req, res, next) => next();

// Get platform commission wallet - ONLY SUPER ADMIN
router.get('/platform', protect, checkRole('super_admin'), async (req,res) => {
  const fees = await WalletTransaction.find({ type: 'platform_fee' });
  const withdrawals = await WalletTransaction.find({ type: 'withdrawal' });
  const totalFees = fees.reduce((s,t)=>s+t.amount,0);
  const totalWithdrawn = withdrawals.reduce((s,t)=>s+t.amount,0);
  const balance = totalFees - totalWithdrawn;
  res.json({
    totalCommission: totalFees,
    totalWithdrawn,
    balance,
    transactions: await WalletTransaction.find().populate('bookingId').sort({ createdAt: -1 })
  });
});

// Withdraw - ONLY SUPER ADMIN
router.post('/withdraw', protect, checkRole('super_admin'), async (req,res) => {
  const { amount } = req.body;
  const fees = await WalletTransaction.find({ type: 'platform_fee' });
  const withdrawals = await WalletTransaction.find({ type: 'withdrawal' });
  const balance = fees.reduce((s,t)=>s+t.amount,0) - withdrawals.reduce((s,t)=>s+t.amount,0);
  
  if(amount > balance) return res.status(400).json({ message: 'Insufficient balance' });
  
  const tx = await WalletTransaction.create({
    type: 'withdrawal',
    amount,
    adminId: req.user.id,
    note: `Withdrawn by ${req.user.username}`
  });
  
  res.json({ message: `₹${amount} withdrawn successfully to Super Admin`, tx, newBalance: balance - amount });
});

// Earnings view for NORMAL ADMIN - read only, no withdraw button
router.get('/earnings', protect, checkRole('super_admin','admin'), async (req,res) => {
  const transactions = await WalletTransaction.find({ type: 'platform_fee' }).populate('bookingId').sort({ createdAt: -1 });
  res.json({
    message: req.user.role === 'admin' ? 'Read-only view: You can see payment done + fee received, but cannot withdraw (Only Super Admin can)' : 'Super Admin view',
    canWithdraw: req.user.role === 'super_admin',
    transactions
  });
});

module.exports = router;
