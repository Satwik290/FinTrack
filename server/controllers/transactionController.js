const Transaction = require('../models/Transaction');

// ➕ Create
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, paymentMethod, notes } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      date,
      paymentMethod,
      notes
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to add transaction", error: err.message });
  }
};

// 📊 Read (all for a user)
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

// ✏️ Update
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to update transaction", error: err.message });
  }
};

// ❌ Delete
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
};

// Get summary (monthly or yearly)
exports.getSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const match = { userId: req.user.id };

    if (year) {
      match["$expr"] = { $eq: [{ $year: "$date" }, parseInt(year)] };
    }
    if (month) {
      match["$expr"] = { $and: [
        { $eq: [{ $year: "$date" }, parseInt(year)] },
        { $eq: [{ $month: "$date" }, parseInt(month)] }
      ]};
    }

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const income = summary.find(s => s._id === "income")?.total || 0;
    const expense = summary.find(s => s._id === "expense")?.total || 0;

    res.json({ income, expense, savings: income - expense });
  } catch (err) {
    res.status(500).json({ message: "Failed to get summary", error: err.message });
  }
};
