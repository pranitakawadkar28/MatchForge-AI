import { NODE_ENV } from "../../config/env.js";

import { 
  loginService,
  registerService, 
  verifyEmailService
} from "../../services/auth/auth.service.js";

export const registerController = async (req, res, next) => {
  try {
    const { user } = await registerService(req.body);

    res.status(201).json({
      success: true,
      message: "USER REGISTERED SUCCESSFULLY",
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginService(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "USER_LOGGED_IN_SUCCESSFULLY",
      data: {
        user
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await verifyEmailService(req.params.token);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "EMAIL_VERIFIED_SUCCESSFULLY",
      data: { user },
    });

  } catch (err) {
    next(err);
  }
};