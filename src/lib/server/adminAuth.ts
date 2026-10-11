import crypto from 'crypto';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ndtri2004';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tri2004@@';

const SECRET = process.env.ADMIN_JWT_SECRET || 'tram-tarot-admin-secret-key-2026';

export function verifyCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createAdminToken(): string {
  const payload = {
    user: ADMIN_USERNAME,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 ngày
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSig) return false;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.user !== ADMIN_USERNAME) return false;
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(req: Request): boolean {
  // 1. Kiểm tra cookie admin_token
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  if (match && verifyAdminToken(match[1])) {
    return true;
  }

  // 2. Kiểm tra header Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  return false;
}
