const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const prisma = require("../config/db");
const env = require("../config/env");

const SALT_ROUNDS = 10;

// Initialize Google OAuth2 client
const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message || err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Google-only users don't have a password
    if (!user.password) {
      return res.status(401).json({
        error: "This account uses Google Sign-In. Please sign in with Google.",
      });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message || err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Google Sign-In / Sign-Up
 * Receives a Google ID token, verifies it, and creates or finds the user.
 */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required." });
    }

    if (!googleClient) {
      return res.status(500).json({
        error: "Google Sign-In is not configured. Set GOOGLE_CLIENT_ID in .env",
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: "Google account has no email." });
    }

    // Try to find existing user by googleId first, then by email
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Check if a user with this email already exists (email/password account)
      user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // Link Google account to existing email user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: picture || user.avatar,
            name: user.name || name || null,
          },
        });
      } else {
        // Create a brand new user (Google-only, no password)
        user = await prisma.user.create({
          data: {
            email,
            name: name || null,
            googleId,
            avatar: picture || null,
          },
        });
      }
    } else {
      // Existing Google user — update avatar/name if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: picture || user.avatar,
          name: user.name || name || null,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: "7d" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google login error:", err.message || err);
    if (err.message?.includes("Token used too late") || err.message?.includes("Invalid token")) {
      return res.status(401).json({ error: "Google token expired or invalid. Please try again." });
    }
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user });
  } catch (err) {
    console.error("GetMe error:", err.message || err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = exports;
