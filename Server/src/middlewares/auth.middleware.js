import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import userModel from "../models/user/user.model.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new AppError("UNAUTHORIZED", 401);

    //  Check blacklist FIRST (cheapest Redis check, no DB hit)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    // Then verify signature
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Then hit the DB
    const user = await userModel.findById(decoded.userId);
    if (!user) throw new AppError("USER_NOT_FOUND", 404);

    // Token version check
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError("TOKEN_REVOKED", 401);
    }

    //  THIS IS THE KEY LINE
    req.user = {
      userId: decoded.userId,
      tokenVersion: decoded.tokenVersion,
    };

    next();
  } catch (err) {
    next(err);
  }
};
