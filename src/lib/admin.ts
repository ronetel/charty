import { verifyToken } from './jwt';

export function isAdminFromToken(token: string | null) {
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload || !payload.roles) return false;
  const roles = (payload.roles || []).map((r: any) => String(r).toLowerCase());
  return roles.includes('admin');
}

export function getTokenFromHeader(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  return parts[1];
}
