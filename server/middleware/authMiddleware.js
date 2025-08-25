const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  let token;

  // Option 1: From cookie
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Option 2: From Authorization header
  else if (req.header("Authorization")) {
    token = req.header("Authorization").split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
