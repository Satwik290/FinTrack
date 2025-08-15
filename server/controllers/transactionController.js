const Transaction = require('../models/Transaction');
const validateTransaction = require('../utils/validateTransaction');

exports.addTransaction = async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  // Validation
  const { isValid, errors } = validateTransaction({ type, amount, category });
  if (!isValid) return res.status(400).json({ errors });

  try {
    const transaction = await Transaction.create({
      userId: req.user,
      type,
      amount,
      category,
      note,
      date
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to add transaction" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};
