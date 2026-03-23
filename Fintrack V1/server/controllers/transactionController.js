const Transaction = require('../models/Transaction');

// ➕ Create - FIXED with normalization
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, paymentMethod, notes } = req.body;

    console.log(`🔍 Creating transaction:`, { type, amount, category, date });

    const transaction = await Transaction.create({
      userId: req.user.id, // Fixed: use consistent userId reference
      type,
      amount: parseFloat(amount), // FIXED: Ensure number conversion
      category: category.trim().toLowerCase(), // FIXED: Normalize category
      date,
      paymentMethod,
      notes
    });

    console.log(`✅ Transaction created:`, { 
      id: transaction._id, 
      type: transaction.type, 
      amount: transaction.amount, 
      category: transaction.category 
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('❌ Failed to create transaction:', err);
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

// ✏️ Update - FIXED with normalization
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, date, paymentMethod, notes } = req.body;

    console.log(`🔍 Updating transaction ${id}:`, { type, amount, category, date });

    // FIXED: Normalize the data before updating
    const updateData = {
      ...(type && { type }),
      ...(amount && { amount: parseFloat(amount) }), // Ensure number
      ...(category && { category: category.trim().toLowerCase() }), // Normalize category
      ...(date && { date }),
      ...(paymentMethod && { paymentMethod }),
      ...(notes !== undefined && { notes })
    };

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    console.log(`✅ Transaction updated:`, { 
      id: transaction._id, 
      type: transaction.type, 
      amount: transaction.amount, 
      category: transaction.category 
    });

    res.json(transaction);
  } catch (err) {
    console.error('❌ Failed to update transaction:', err);
    res.status(500).json({ message: "Failed to update transaction", error: err.message });
  }
};

// ❌ Delete
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    console.log(`✅ Transaction deleted:`, { 
      id: transaction._id, 
      type: transaction.type, 
      amount: transaction.amount, 
      category: transaction.category 
    });

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
};

// Get summary (monthly or yearly) - FIXED aggregation
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

    console.log(`🔍 Summary query:`, match);

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: { $toDouble: "$amount" } }, // FIXED: Handle string amounts
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`📊 Summary result:`, summary);

    const income = summary.find(s => s._id === "income")?.total || 0;
    const expense = summary.find(s => s._id === "expense")?.total || 0;

    res.json({ income, expense, savings: income - expense });
  } catch (err) {
    console.error('❌ Failed to get summary:', err);
    res.status(500).json({ message: "Failed to get summary", error: err.message });
  }
};