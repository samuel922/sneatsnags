import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateToken = (payload: object): string => {
  const expires = {
    expiresIn: config.JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, config.JWT_SECRET);
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
