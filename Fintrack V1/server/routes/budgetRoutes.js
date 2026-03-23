const express = require('express');
const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetUtilization
} = require('../controllers/budgetController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// CRUD
router.post('/', auth, addBudget);       // Create
router.get('/', auth, getBudgets);       // Read
router.put('/:id', auth, updateBudget);  // Update
router.delete('/:id', auth, deleteBudget);// Delete

// Utilization
router.get('/utilization', auth, getBudgetUtilization);

module.exports = router;
