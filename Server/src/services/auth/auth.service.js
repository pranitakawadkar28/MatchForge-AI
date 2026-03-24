import userModel from "../../models/user/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import crypto from "crypto";

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

  // Create user
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });

  return { user };
};

export const loginService = async ({ email, password }) => {
  // Check user exists
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("INVALID_CREDENTIALS", 401);
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