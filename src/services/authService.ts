import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../utils/prisma";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import { RegisterRequest, LoginRequest, AuthResponse } from "../types/auth";
import { logger } from "../utils/logger";
import { loginSchema } from "../utils/validations";

export class AuthService {
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "BUYER",
    } = data;

    //Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("User already excist with this email");
    }

    //Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    //Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    //Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        emailVerifyToken,
      },
    });

    //Send verification email
    await sendVerificationEmail(email, emailVerifyToken);

    logger.info(`User registered: ${email}`);

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    //Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || user.isActive) {
      throw new Error("Invalid credentials");
    }

    //Check Password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invlaid Credentials.");
    }

    //Update last login
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    //Generate token
    const token = generateToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      refreshToken,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    logger.info(`Email verified for user: ${user.email}`);

    return { message: "Email verified successfully" };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        message:
          "If an account with that email exists, we sent a password reset link.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    return {
      message:
        "If an account with that email exists, we sent a password reset link.",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    logger.info(`Password reset for user: ${user.email}`);

    return { message: "Password reset successfully" };
  }
}
