
export interface JwtPayload {
  id: number;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}
import { sign, verify, SignOptions } from 'jsonwebtoken';

const SECRET: string = process.env.JWT_SECRET || 'dev-secret-for-dev-only';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Using default JWT secret. Set JWT_SECRET in .env');
}

export function signToken(
  payload: Record<string, unknown>,
  expiresIn: number = 28800
): string {
  const options: SignOptions = { expiresIn };
  return sign(payload, SECRET, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export default { signToken, verifyToken };