
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret"; // Add this to env

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file");
}

import { sendEmail } from "../services/emailService.js";

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    const expires = Date.now() + 5 * 60 * 1000;

    // Save OTP in MongoDB with 5 min expiry
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expires },
      { upsert: true, new: true }
    );


    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f4f6f8;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <!-- Logo Area -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-bottom: 20px;">
                  <tr>
                    <td align="center">
                      <h2 style="color: #2d3748; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Mockeefy</h2>
                    </td>
                  </tr>
                </table>

                <!-- Main Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  <!-- Header Stripe -->
                  <tr>
                    <td style="background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%); height: 6px;"></td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px; text-align: center;">
                      <h1 style="color: #1a202c; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Authentication Required</h1>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                        Please use the following One-Time Password (OTP) to complete your login securely.
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 24px; margin-bottom: 32px; display: inline-block; min-width: 200px;">
                        <span style="font-family: 'Monaco', 'Menlo', 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #2d3748; letter-spacing: 8px;">${otp}</span>
                      </div>

                      <p style="color: #718096; font-size: 14px; margin: 0;">
                        This code is valid for <strong>5 minutes</strong>.<br>
                        Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="border-top: 1px solid #edf2f7;"></td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px; background-color: #f8fafc; text-align: center;">
                      <p style="color: #718096; font-size: 12px; margin: 0 0 8px 0;">
                        If you didn't request this email, you can safely ignore it.
                      </p>
                      <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Mockeefy. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
    `;

    // Use shared email service
    const sent = await sendEmail({
      to: email,
      subject: "Your One-Time Password (OTP) - Mockeefy",
      html
    });

    if (!sent) {
      console.error(`[OTP] Failed to send email to ${email}. emailService returned false.`);
      throw new Error("Failed to send email via emailService");
    }

    console.log(`[OTP] Email sent successfully to ${email}`);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("[OTP] Detailed Error:", error);
    res.status(500).json({ message: "Error processing OTP request", error: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email });

    if (!record) return res.status(400).json({ message: "OTP not found" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
    if (parseInt(otp) !== record.otp) return res.status(400).json({ message: "Invalid OTP" });

    // Delete the OTP after successful verification
    await Otp.deleteOne({ email });

    // Generate Reset Token (valid for 10 min)
    // This token is required to reset the password
    const resetToken = jwt.sign(
      { email, purpose: 'reset_password' },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ message: "OTP verified successfully", resetToken });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: "Reset token and new password are required" });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);

    if (decoded.purpose !== 'reset_password') {
      return res.status(403).json({ message: "Invalid token purpose" });
    }

    const { email } = decoded;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};

// Verify Google Token (ID Token or Access Token)
export const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Google token is required" });
  }

  let googleId, email, name, picture;

  try {
    // 1. Try as ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    googleId = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch (idTokenError) {
    // 2. Try as Access Token
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to verify access token');

      const payload = await response.json();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } catch (accessTokenError) {
      return res.status(401).json({ message: "Invalid Google token" });
    }
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });
    // ... rest of logic ...

    if (existingUser) {
      // User exists, log them in
      const accessToken = jwt.sign(
        {
          email: existingUser.email,
          userType: existingUser.userType,
          name: existingUser.name,
          userId: existingUser._id
        },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { userId: existingUser._id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        exists: true,
        message: "Login successful",
        accessToken,
        user: {
          email: existingUser.email,
          userType: existingUser.userType,
          name: existingUser.name,
          userId: existingUser._id,
          personalInfo: existingUser.personalInfo,
          profileImage: existingUser.profileImage
        }
      });
    }

    // Return verification success and user info for step 3 (Signup)
    res.status(200).json({
      exists: false,
      message: "Google token verified successfully",
      googleData: {
        email: email.toLowerCase(),
        name,
        googleId,
        picture
      }
    });

  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid Google token", error: error.message });
  }
};

// Register User
export const registerUser = async (req, res) => {
  const { email, password, userType, name, googleId } = req.body;

  if (!email || !password || !userType || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(googleId ? [{ googleId }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      name,
      googleId
    });

    await newUser.save();

    // Generate tokens for auto-login
    const accessToken = jwt.sign(
      {
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        userId: newUser._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        userId: newUser._id,
        personalInfo: newUser.personalInfo,
        profileImage: newUser.profileImage
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate Access Token (15 min)
    const accessToken = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate Refresh Token (7 days)
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send Refresh Token as HttpOnly Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: process.env.NODE_ENV === 'production', // https only
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "Login successful",
      accessToken, // Send access token to client
      user: {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id,
        personalInfo: user.personalInfo,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Refresh Token
export const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Generate new Access Token
    const accessToken = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });

  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

// Logout User
export const logoutUser = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.json({ message: 'Cookie cleared' });
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Protected route example
export const getProfile = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Error getting profile", error: error.message });
  }
};