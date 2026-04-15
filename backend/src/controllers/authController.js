const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");
const { STAFF_PERMISSIONS, ROLES } = require("../utils/permissions");

const signToken = (userId) => jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: role || ROLES.STAFF,
    permissions: role === ROLES.ADMIN ? [] : STAFF_PERMISSIONS.SALES_BILLING
  });

  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user._id);

  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  signup,
  login,
  me
};
