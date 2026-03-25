import crypto from "crypto";

import jwt from "jsonwebtoken";

import userModel from "../../models/user/user.model.js";

import { AppError } from "../../utils/AppError.js";

import { comparePassword, hashPassword } from "../../utils/hash.js";

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

import { sendEmail } from "../../utils/sendMail.js";

import { generateEmailToken } from "../../utils/token.js";

import { EMAIL_TOKEN_EXPIRY, FRONTEND_URL, REFRESH_TOKEN_SECRET } from "../../config/env.js";

import { blacklistToken, isTokenBlacklisted } from "../../utils/tokenBlacklist.js";

export const registerService = async ({ username, email, password }) => {
  // Check user exists
  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new AppError("USER_ALREADY_EXISTS", 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate email token once
  const { token, hashToken } = generateEmailToken();

  // Create user
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    isEmailVerified: false,
    emailVerificationToken: hashToken,
    emailVerificationExpires: Date.now() + EMAIL_TOKEN_EXPIRY,
  });

  // Send verification email with SAME token
  await sendVerification(user, token);

  return { user };
};

export const loginService = async ({ email, password }) => {
  // Check user exists
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("INVALID_CREDENTIALS", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("EMAIL_NOT_VERIFIED", 403);
  }

  // Password match
  const isMatched = await comparePassword(password, user.password);

  if (!isMatched) {
    throw new AppError("INVALID_CREDENTIALS", 401);
  }

  // generate tokens
  // access Token
  const accessToken = generateAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  // refresh token
  const refreshToken = generateRefreshToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  // hash refresh token and save
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedToken;
  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const verifyEmailService = async (token, oldAccessToken, oldRefreshToken) => {

  const hashToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

  const user = await userModel.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select("+refreshToken");

  if (!user) throw new AppError("TOKEN_INVALID_OR_EXPIRED", 400);

  // Check if already verified
    if (user.isEmailVerified) throw new AppError("EMAIL_ALREADY_VERIFIED", 400);

    //  Blacklist old access token if user was already logged in
  if (oldAccessToken) {
    const accessDecoded = jwt.decode(oldAccessToken);
    const accessTtl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
    if (accessTtl > 0) await blacklistToken(oldAccessToken, accessTtl);
  }

  //  Blacklist old refresh token if present
  if (oldRefreshToken) {
    const refreshDecoded = jwt.decode(oldRefreshToken);
    const refreshTtl = refreshDecoded?.exp - Math.floor(Date.now() / 1000);
    if (refreshTtl > 0) await blacklistToken(oldRefreshToken, refreshTtl);
  }

  // Mark verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

 // Generate new tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  // Hash and save new refresh token
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedToken;

  await user.save();

  // Sanitize user before returning
  const sanitizedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };

  return { user: sanitizedUser, accessToken, refreshToken };
};

const sendVerification = async (user, token) => {
  const verifyURL = `${FRONTEND_URL}/verify-email/${token}`;

  await sendEmail(
    user.email,
    "Verify your email",
    `<a href="${verifyURL}">Verify Account</a>`,
  );
};

export const forgotPasswordService = async (email) => {
  const user = await userModel.findOne({ email });

  // Prevent email enumeration
  if (!user) return;

  // Generate raw token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash before saving
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save in DB with expiry
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail(
      user.email,
      "Reset Password",
      `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password.</p>
    <p>This link will expire in 15 minutes.</p>
    <a href="${resetUrl}" 
       style="display:inline-block;padding:10px 15px;
              background:#2563eb;color:white;
              text-decoration:none;border-radius:5px;">
       Reset Password
    </a>
    <p>If you did not request this, please ignore this email.</p>
  </div>
`,
    );
  } catch (err) {
    // Remove token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Email could not be sent", 500);
  }

  // Return the raw token if you need it
  return resetToken;
};

export const resetPasswordService = async (
  token,
  password,
  confirmPassword,
  accessToken,
  refreshToken
) => {
  if (password !== confirmPassword)
    throw new AppError("Passwords do not match", 400);

  const hashedToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+refreshToken");

  if (!user) throw new AppError("Token invalid or expired", 400);

  // Blacklist current access token if user was logged in during reset
  if (accessToken) {
    const accessDecoded = jwt.decode(accessToken);
    const accessTtl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
    if (accessTtl > 0) await blacklistToken(accessToken, accessTtl);
  }

  // Blacklist current refresh token if present
  if (refreshToken) {
    const refreshDecoded = jwt.decode(refreshToken);
    const refreshTtl = refreshDecoded?.exp - Math.floor(Date.now() / 1000);
    if (refreshTtl > 0) await blacklistToken(refreshToken, refreshTtl);
  }

  // Update password
  user.password = await hashPassword(password);

  //  Clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Increment tokenVersion → kills ALL other active sessions on next request
  user.tokenVersion += 1;

  // Remove refreshToken from DB → no refresh possible
  user.refreshToken = undefined;

  await user.save();

  return user;
};

export const getProfileService = async (userId) => {

  const user = await userModel
    .findById(userId);

  if (!user) {
    throw new AppError("USER_NOT_FOUND", 404);
  }

  return user;
};

export const refreshTokenService = async (incomingRefreshToken, oldAccessToken) => {
  
  if (!incomingRefreshToken) throw new AppError("REFRESH_TOKEN_REQUIRED", 401);

  //  Check blacklist FIRST before any DB/CPU work
  const isBlacklisted = await isTokenBlacklisted(incomingRefreshToken);
  if (isBlacklisted) throw new AppError("TOKEN_REVOKED", 401);

  // verify JWT signature
  const decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);

  // hash incoming token to compare with DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  const user = await userModel.findOne({
    _id: decoded.userId,
    refreshToken: hashedToken,
  });

  if (!user) throw new AppError("TOKEN_REUSE_DETECTED", 403);

  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new AppError("TOKEN_REVOKED", 401);
  }

  // Blacklist old refresh token immediately (token rotation)
  const refreshTtl = decoded.exp - Math.floor(Date.now() / 1000);
  if (refreshTtl > 0) await blacklistToken(incomingRefreshToken, refreshTtl);

  // Blacklist old access token immediately
  if (oldAccessToken) {
    const accessDecoded = jwt.decode(oldAccessToken);
    const accessTtl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
    if (accessTtl > 0) await blacklistToken(oldAccessToken, accessTtl);
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  const newRefreshToken = generateRefreshToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  user.refreshToken = newHashedToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutService = async (incomingRefreshToken, accessToken) => {
  if (!incomingRefreshToken) {
    throw new AppError("REFRESH_TOKEN_REQUIRED", 401);
  }

  const decoded = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);

  const user = await userModel.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new AppError("USER_NOT_FOUND", 404);
  }

  if (!user.refreshToken) {
    // Already logged out — but still blacklist the access token if present
    if (accessToken) {
      const accessDecoded = jwt.decode(accessToken);
      const ttl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) await blacklistToken(accessToken, ttl); 
    }
    return true;
  }

  // Hash incoming token to compare with DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

  if (user.refreshToken !== hashedToken) {
    throw new AppError("INVALID_REFRESH_TOKEN", 401);
  }

  // Blacklist refresh token in Redis
  const refreshTtl = decoded.exp - Math.floor(Date.now() / 1000);
  if (refreshTtl > 0) await blacklistToken(incomingRefreshToken, refreshTtl);

  // Blacklist access token in Redis
  if (accessToken) {
    const accessDecoded = jwt.decode(accessToken);
    const accessTtl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
    if (accessTtl > 0) await blacklistToken(accessToken, accessTtl);
  }

  user.refreshToken = null;
  await user.save();

  return true;
};

export const logoutAllService = async (userId, accessToken, refreshToken) => {

  // Find user
  const user = await userModel.findById(userId);

  if (!user) throw new AppError("USER_NOT_FOUND", 404);

  // Blacklist current access token immediately
  if (accessToken) {
    const accessDecoded = jwt.decode(accessToken);
    const accessTtl = accessDecoded?.exp - Math.floor(Date.now() / 1000);
    if (accessTtl > 0) await blacklistToken(accessToken, accessTtl);
  }

  // Blacklist current refresh token immediately
  if (refreshToken) {
    const refreshDecoded = jwt.decode(refreshToken);
    const refreshTtl = refreshDecoded?.exp - Math.floor(Date.now() / 1000);
    if (refreshTtl > 0) await blacklistToken(refreshToken, refreshTtl);
  }

  // Increment tokenVersion → kills ALL other active tokens on next request
  user.tokenVersion += 1;

  // Remove refresh token from DB
  user.refreshToken = undefined;

  await user.save();

  return true;
};
