module.exports = function validateTransaction({ type, amount, category }) {
  const errors = {};

  if (!type || !['income', 'expense'].includes(type)) {
    errors.type = "Type must be either 'income' or 'expense'";
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (!category || category.trim().length < 3) {
    errors.category = "Category must be at least 3 characters long";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
