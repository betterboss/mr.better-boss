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

// In-memory user store. Resets on server restart, which is fine because:
// 1. Session restore uses JWT (self-contained, no DB lookup needed)
// 2. Register creates a new entry
// 3. Login requires the entry to exist (user must re-register after restart, or use saved JWT)
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
  // If user was restored from JWT (empty passwordHash), update in place
  const existing = users.get(email.toLowerCase());
  if (existing && !existing.passwordHash) {
    existing.name = name;
    existing.company = company;
    existing.passwordHash = hashPassword(password);
    users.set(existing.email, existing);
    return existing;
  }

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

// Ensure a user record exists in memory (for after server restart)
// This allows API key storage to work even after the in-memory map resets
export function ensureUser(payload: UserPayload): StoredUser {
  const existing = users.get(payload.email.toLowerCase());
  if (existing) return existing;

  const user: StoredUser = {
    id: payload.id,
    email: payload.email.toLowerCase(),
    name: payload.name,
    company: payload.company,
    passwordHash: '',
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
