import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRY } from './constants';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  company: string;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  company: string;
  passwordHash: string;
  jobtreadApiKey?: string;
  anthropicApiKey?: string;
  createdAt: string;
}

// In-memory user store (in production, use a database)
// For this sidebar app, localStorage on client + JWT is sufficient
const users: Map<string, StoredUser> = new Map();

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.get(email.toLowerCase());
}

export function createUser(
  email: string,
  password: string,
  name: string,
  company: string
): StoredUser {
  const id = crypto.randomUUID();
  const user: StoredUser = {
    id,
    email: email.toLowerCase(),
    name,
    company,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.set(user.email, user);
  return user;
}

export function updateUserApiKeys(
  email: string,
  jobtreadApiKey?: string,
  anthropicApiKey?: string
): StoredUser | null {
  const user = users.get(email.toLowerCase());
  if (!user) return null;
  if (jobtreadApiKey !== undefined) user.jobtreadApiKey = jobtreadApiKey;
  if (anthropicApiKey !== undefined) user.anthropicApiKey = anthropicApiKey;
  users.set(user.email, user);
  return user;
}
