const express = require('express');
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, addTransaction);
router.get('/', auth, getTransactions);
router.delete('/:id', auth, deleteTransaction);

module.exports = router;
