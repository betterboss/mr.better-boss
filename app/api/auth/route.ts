import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByEmail,
  createUser,
  verifyPassword,
  createToken,
  verifyToken,
  updateUserApiKeys,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'register') {
      const { email, password, name, company } = body;

      if (!email || !password || !name || !company) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const existing = findUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const user = createUser(email, password, name, company);
      const token = createToken({ id: user.id, email: user.email, name: user.name, company: user.company });

      return NextResponse.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, company: user.company },
      });
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = findUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = createToken({ id: user.id, email: user.email, name: user.name, company: user.company });

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          hasJobtreadKey: !!user.jobtreadApiKey,
          hasAnthropicKey: !!user.anthropicApiKey,
        },
      });
    }

    if (action === 'verify') {
      const { token } = body;
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.json({ user: payload });
    }

    if (action === 'update-keys') {
      const { token, jobtreadApiKey, anthropicApiKey } = body;
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = updateUserApiKeys(payload.email, jobtreadApiKey, anthropicApiKey);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        hasJobtreadKey: !!user.jobtreadApiKey,
        hasAnthropicKey: !!user.anthropicApiKey,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
