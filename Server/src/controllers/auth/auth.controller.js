import { NODE_ENV } from "../../config/env.js";

import { 
  forgotPasswordService,
  getProfileService,
  loginService,
  logoutAllService,
  logoutService,
  refreshTokenService,
  registerService, 
  resetPasswordService, 
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

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    res.status(200).json({ 
      message: "CHECK YOUR EMAIL FOR RESET LINK" 
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    await resetPasswordService(token, password, confirmPassword);

    res.status(200).json({ message: "PASSWORD RESET SUCCESSFULLY" });
  } catch (err) {
    next(err);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) throw new AppError("Unauthorized access", 401);

    const user = await getProfileService(userId);

    res.status(200).json({
      success: true,
      message: "PROFILE FETCHED SUCCESSFULLY",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;

    const { accessToken, refreshToken } =
      await refreshTokenService(incomingRefreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "TOKEN_REFRESHED",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    await logoutService(req.cookies.refreshToken);

    // Clear cookies
    res.clearCookie("accessToken", 
      { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict" 
      }
    );

    res.clearCookie("refreshToken", 
      { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict" 
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const logoutAllController = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // req.user.id → token validation middleware
    await logoutAllService(req.user.userId);

    // Clear current cookies
    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });


    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully!",
    });
  } catch (err) {
    next(err);
  }
};