import { Request } from "express";
import { User } from "@prisma/client";
import { errorResponse } from "./response";

export interface AuthRequest extends Request {
  user: User;
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.json(errorResponse("Insufficient permissions"));
    }
    next();
  };
};
