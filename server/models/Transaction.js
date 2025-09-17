// server/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  amount: { 
    type: Number,  // Ensure it's stored as Number
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true,
    lowercase: true,  // Automatically convert to lowercase
    trim: true        // Automatically trim whitespace
  },
  date: { 
    type: Date, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'upi', 'other'],
    default: 'cash'
  },
  notes: { 
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Add index for better query performance
transactionSchema.index({ userId: 1, category: 1, type: 1, date: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);