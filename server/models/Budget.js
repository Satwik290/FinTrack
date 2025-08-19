const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  type: { type: String, enum: ['monthly', 'yearly'], required: true },
  month: { type: Number }, // required if monthly
  year: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
