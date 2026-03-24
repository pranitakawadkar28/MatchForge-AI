import crypto from "crypto";
import userModel from "../../models/user/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/hash.js";

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