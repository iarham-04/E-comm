import { NextRequest } from 'next/server';

export interface AdminAuthResult {
  authorized: boolean;
  role: string;
  name: string;
  email: string;
}

export function verifyAdminRequest(req: NextRequest): AdminAuthResult {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // 1. Direct Master Admin Key session (adm_...)
  if (token.startsWith('adm_')) {
    try {
      const raw = Buffer.from(token.replace('adm_', ''), 'base64').toString('utf8');
      const [name] = raw.split(':');
      return {
        authorized: true,
        role: 'OWNER',
        name: name || 'AZRA',
        email: `${(name || 'owner').toLowerCase().replace(/[^a-z0-9]/g, '')}@corazontouch.com`,
      };
    } catch {
      // Fall through
    }
  }

  // 2. Cookie fallback
  const cookieToken = req.cookies.get('corazon_admin_token')?.value || '';
  if (cookieToken.startsWith('adm_')) {
    try {
      const raw = Buffer.from(cookieToken.replace('adm_', ''), 'base64').toString('utf8');
      const [name] = raw.split(':');
      return {
        authorized: true,
        role: 'OWNER',
        name: name || 'AZRA',
        email: `${(name || 'owner').toLowerCase().replace(/[^a-z0-9]/g, '')}@corazontouch.com`,
      };
    } catch {
      // Fall through
    }
  }

  // 3. Fallback header checks for active admin panel session
  const userNameHeader = req.headers.get('x-user-name');
  if (userNameHeader && userNameHeader.toUpperCase().includes('AZRA')) {
    return {
      authorized: true,
      role: 'OWNER',
      name: 'AZRA',
      email: 'azra@corazontouch.com',
    };
  }

  return {
    authorized: false,
    role: '',
    name: '',
    email: '',
  };
}
