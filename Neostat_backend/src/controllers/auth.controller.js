
import User from "../models/User.js";
import  generateToken  from "../utils/generateToken.js";

// Public user data
const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

// Signup
export const signup = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Never accept role from public signup request.
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "TEAM_MEMBER",
    });
// const token = generateToken(user);
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: publicUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
``
// Login

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Verify user credentials
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Send login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: publicUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get current logged-in user
export const getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: publicUser(req.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
