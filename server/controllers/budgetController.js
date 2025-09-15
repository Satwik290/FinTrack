const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const validateBudget = require('../utils/validateBudget');

exports.addBudget = async (req, res) => {
  try {
    const { category, limit, type, month, year } = req.body;

    // ✅ Run validation before proceeding
    const { isValid, errors } = validateBudget({ category, limit, year });
    if (!isValid) return res.status(400).json({ errors });

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
    res.status(500).json({ message: "Failed to add budget", error: err.message });
  }
};

// 📊 Read
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch budgets", error: err.message });
  }
};

// ✏️ Update
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: "Failed to update budget", error: err.message });
  }
};

// ❌ Delete
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete budget", error: err.message });
  }
};


// 📈 Utilization Summary
exports.getBudgetUtilization = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Fetch budgets of the logged-in user
    const budgets = await Budget.find({
      userId: req.user.id,
      year,
      ...(month && { month }),
    });

    // For each budget, calculate spent amount
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const match = { userId: req.user.id, category: budget.category };

        if (budget.type === "yearly") {
          match.$expr = { $eq: [{ $year: "$date" }, budget.year] };
        } else if (budget.type === "monthly") {
          match.$expr = {
            $and: [
              { $eq: [{ $year: "$date" }, budget.year] },
              { $eq: [{ $month: "$date" }, budget.month] },
            ],
          };
        }

        // Calculate transactions total
        const spentAgg = await Transaction.aggregate([
          { $match: match },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent = spentAgg[0]?.total || 0;

        return {
          category: budget.category,
          type: budget.type,
          year: budget.year,
          month: budget.month || null,
          limit: budget.limit,
          spent,
          remaining: budget.limit - spent,
          utilization: ((spent / budget.limit) * 100).toFixed(2) + "%",
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({
      message: "Failed to calculate budget utilization",
      error: err.message,
    });
  }
};
