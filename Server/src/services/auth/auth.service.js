import crypto from "crypto";

import userModel from "../../models/user/user.model.js";

import { AppError } from "../../utils/AppError.js";

import { 
  comparePassword, 
  hashPassword 
} from "../../utils/hash.js";

import { 
  generateAccessToken, 
  generateRefreshToken 
} from "../../utils/jwt.js";

import { sendEmail } from "../../utils/sendMail.js";

import { generateEmailToken } from "../../utils/token.js";

import { EMAIL_TOKEN_EXPIRY, FRONTEND_URL } from "../../config/env.js";

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
  console.log("MATCH RESULT:", isMatched);

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

export const verifyEmailService = async (token) => {
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userModel.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError("TOKEN_INVALID_OR_EXPIRED", 400);

  // mark verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  // generate tokens (same as login)
  const accessToken = generateAccessToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
    tokenVersion: user.tokenVersion,
  });

  // hash refresh token
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = hashedToken;

  await user.save();

  return { user, accessToken, refreshToken };
};

const sendVerification = async (user, token) => {
  const verifyURL = `${FRONTEND_URL}/verify-email/${token}`;

  console.log("verify URL ---->", verifyURL);

  await sendEmail(
    user.email,
    "Verify your email",
    `<a href="${verifyURL}">Verify Account</a>`
  );
};