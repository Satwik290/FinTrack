const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Set budget
exports.setBudget = async (req, res) => {
  try {
    const { category, limit, type, month, year } = req.body;

    if (type === "monthly" && !month) {
      return res.status(400).json({ message: "Month is required for monthly budget" });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      category,
      limit,
      type,
      month,
      year
    });

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: "Failed to set budget", error: err.message });
  }
};

// Get budget status
exports.getBudgets = async (req, res) => {
  try {
    const { year, month } = req.query;

    const budgets = await Budget.find({
      userId: req.user.id,
      year,
      ...(month ? { month } : {})
    });

    const results = [];

    for (let budget of budgets) {
      let match = {
        userId: req.user.id,
        category: budget.category,
        $expr: { $eq: [{ $year: "$date" }, parseInt(year)] }
      };
      if (budget.type === "monthly" && month) {
        match.$expr = { $and: [
          { $eq: [{ $year: "$date" }, parseInt(year)] },
          { $eq: [{ $month: "$date" }, parseInt(month)] }
        ]};
      }

      const spent = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const totalSpent = spent[0]?.total || 0;
      results.push({
        category: budget.category,
        limit: budget.limit,
        spent: totalSpent,
        remaining: budget.limit - totalSpent
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to get budgets", error: err.message });
  }
};
