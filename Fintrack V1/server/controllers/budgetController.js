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
      category: category.trim().toLowerCase(), // Ensure normalization
      limit: parseFloat(limit), // Ensure number format
      type,
      month: month ? parseInt(month) : undefined,
      year: parseInt(year)
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
    const { category, limit, ...rest } = req.body;

    const updateData = {
      ...rest,
      ...(category && { category: category.trim().toLowerCase() }),
      ...(limit && { limit: parseFloat(limit) })
    };

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
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

    // fetch all budgets for the user
    const budgets = await Budget.find({
      userId: req.user.id,
      year,
      ...(month && { month }),
    });

    // calculate spent for each budget
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const match = {
          userId: req.user.id,
          category: budget.category.toLowerCase(), // normalize
          type: "expense", // ✅ count only expense transactions
        };

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

        const spentAgg = await Transaction.aggregate([
          { $match: match },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const totalSpent = spentAgg[0]?.total || 0;

        return {
          category: budget.category,
          limit: budget.limit,
          spent: totalSpent,
          remaining: budget.limit - totalSpent,
          utilization:
            budget.limit > 0
              ? ((totalSpent / budget.limit) * 100).toFixed(2) + "%"
              : "0%",
        };
      })
    );

    res.json(results);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to calculate budget utilization",
        error: err.message,
      });
  }
};
