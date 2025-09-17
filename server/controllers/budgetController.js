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

// 📈 FIXED: Utilization Summary
exports.getBudgetUtilization = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : undefined;

    console.log(`🔍 Fetching budget utilization for year: ${currentYear}, month: ${currentMonth}`);

    // Get all budgets for the user
    const budgetQuery = { 
      userId: req.user.id, 
      year: parseInt(currentYear)
    };
    
    if (currentMonth) {
      budgetQuery.month = currentMonth;
    }

    const budgets = await Budget.find(budgetQuery);
    console.log(`📊 Found ${budgets.length} budgets:`, budgets.map(b => ({ category: b.category, limit: b.limit, type: b.type })));

    const results = await Promise.all(
      budgets.map(async (budget) => {
        console.log(`\n🔍 Processing budget: ${budget.category} (${budget.type})`);
        
        const match = {
          userId: req.user.id,
          category: budget.category, // Both should be lowercase now
          type: "expense", // ✅ only count expenses
        };

        // Set date range based on budget type
        if (budget.type === "yearly") {
          match.date = {
            $gte: new Date(`${budget.year}-01-01`),
            $lte: new Date(`${budget.year}-12-31T23:59:59`),
          };
        } else if (budget.type === "monthly") {
          const start = new Date(budget.year, budget.month - 1, 1);
          const end = new Date(budget.year, budget.month, 0, 23, 59, 59);
          match.date = { $gte: start, $lte: end };
        }

        console.log(`📅 Date range:`, match.date);
        console.log(`🔍 Transaction query:`, match);

        // Find matching transactions for debugging
        const matchingTransactions = await Transaction.find(match);
        console.log(`💰 Found ${matchingTransactions.length} matching transactions:`, 
          matchingTransactions.map(t => ({ 
            category: t.category, 
            amount: t.amount, 
            date: t.date,
            type: t.type 
          }))
        );

        // FIXED: Handle amount data type conversion in aggregation
        const spentAgg = await Transaction.aggregate([
          { $match: match },
          { 
            $group: { 
              _id: null, 
              total: { 
                $sum: { 
                  $toDouble: "$amount"  // Convert to number if it's stored as string
                } 
              },
              count: { $sum: 1 }  // Count transactions for debugging
            } 
          },
        ]);

        const spent = spentAgg[0]?.total || 0;
        const transactionCount = spentAgg[0]?.count || 0;
        
        console.log(`💸 Aggregation result:`, spentAgg[0]);
        console.log(`💸 Total spent: ₹${spent} out of ₹${budget.limit} (${transactionCount} transactions)`);

        return {
          category: budget.category,
          limit: budget.limit,
          spent,
          remaining: budget.limit - spent,
          utilization: ((spent / budget.limit) * 100).toFixed(2) + "%",
          budgetType: budget.type,
          budgetYear: budget.year,
          budgetMonth: budget.month
        };
      })
    );

    console.log(`📋 Final results:`, results);
    res.json(results);
  } catch (err) {
    console.error("❌ Budget utilization error:", err);
    res.status(500).json({ message: "Failed to calculate budget utilization", error: err.message });
  }
};