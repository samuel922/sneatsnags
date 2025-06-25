import nodemailer from "nodemailer";
import { config } from "../config/config";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome to AutoMatch Tickets!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button bellow:</p>
        <div style="text-align: center; margin: 30px 0">
            <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This verification link will expire in 24 hours.</p>
    </div>
  `;

  await sendEmail(email, "Verify your email address", html);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also click this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This reset link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `;

  await sendEmail(email, "Reset your password", html);
};
