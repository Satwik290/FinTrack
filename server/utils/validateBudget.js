module.exports = function validateBudget({ category, limit, year }) {
  const errors = {};

  if (!category || category.trim().length < 3) {
    errors.category = "Category must be at least 3 characters long";
  }
  if (!limit || isNaN(limit) || limit <= 0) {
    errors.limit = "Limit must be a positive number";
  }
  if (!year || year < 2000) {
    errors.year = "Year must be valid";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
