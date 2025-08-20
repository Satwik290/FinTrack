const express = require('express');
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary
} = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// CRUD
router.post('/', auth, addTransaction);       // Create
router.get('/', auth, getTransactions);       // Read all
router.put('/:id', auth, updateTransaction);  // Update
router.delete('/:id', auth, deleteTransaction); // Delete

module.exports = router;
