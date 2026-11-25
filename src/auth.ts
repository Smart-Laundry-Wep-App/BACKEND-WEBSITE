import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { config } from "./config.js";
import { rows } from "./db.js";
import type { RowDataPacket } from "mysql2/promise";

export type AppRole = "Admin" | "Kasir" | "Customer";
export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AppRole;
  tokenVersion: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function asyncRoute(
  handler: (req: Request, res: Response) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res).catch(next);
  };
}

export function sendSuccess(
  res: Response,
  data: unknown,
  message: string,
  status = 200,
) {
  return res.status(status).json({ success: true, message, data });
}

export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  return schema.parse(input);
}

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  username: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  password: z.string().min(1).max(128),
}).refine((value) => value.identifier || value.username || value.email, {
  message: "Email/username wajib diisi",
});

export function publicUser(row: RowDataPacket) {
  return {
    id: row.id as string,
    name: row.name as string,
    username: row.username as string,
    email: row.email as string,
    role: row.role as AppRole,
    phone: (row.phone as string | null) ?? "",
    branch: (row.branch as string | null) ?? "",
    address: (row.address as string | null) ?? "",
    avatar: (row.avatar as string | null) ?? "",
  };
}

export function issueToken(user: AuthUser): string {
  return jwt.sign(
    { role: user.role, ver: user.tokenVersion },
    config.JWT_SECRET,
    { subject: user.id, expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
  );
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Token autentikasi wajib disertakan");
    }
    const payload = jwt.verify(header.slice(7), config.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub || typeof payload.ver !== "number") {
      throw new HttpError(401, "Token autentikasi tidak valid");
    }
    const [user] = await rows<RowDataPacket>(
      `SELECT u.id, u.name, u.username, u.email, u.token_version AS tokenVersion, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
      [payload.sub],
    );
    if (!user || Number(user.tokenVersion) !== payload.ver) {
      throw new HttpError(401, "Sesi tidak valid atau telah dicabut");
    }
    req.user = {
      id: user.id as string,
      name: user.name as string,
      username: user.username as string,
      email: user.email as string,
      role: user.role as AppRole,
      tokenVersion: Number(user.tokenVersion),
    };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new HttpError(401, "Sesi tidak valid atau telah kedaluwarsa"));
      return;
    }
    next(error);
  }
}

export function allowRoles(...roles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new HttpError(403, "Anda tidak memiliki izin untuk mengakses fitur ini"));
      return;
    }
    next();
  };
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
