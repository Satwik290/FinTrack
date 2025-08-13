module.exports = function validateUser({ name, email, password }) {
  const errors = {};

  if (!name || name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Invalid email address";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
