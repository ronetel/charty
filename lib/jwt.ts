import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload: Record<string, any>, options: jwt.SignOptions = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d', ...(options || {}) });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}
