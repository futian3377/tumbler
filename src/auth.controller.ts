import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

interface AuthUser {
  username: string;
  role: string;
}

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser;
  }
}

const accounts: Record<string, { password: string }> = {
  writer: { password: 'writer1234!' },
  reviewer: { password: 'reviewer1234!' },
  'factory-user': { password: 'factory1234!' },
};

@Controller('api')
export class AuthController {
  @Get('session')
  getSession(@Req() request: Request): { user: AuthUser | null } {
    return { user: request.session.user ?? null };
  }

  @Post('login')
  login(
    @Body() credentials: { username?: unknown; password?: unknown },
    @Req() request: Request,
  ): { user: AuthUser } | { error: string } {
    const username = credentials?.username;
    const password = credentials?.password;
    const account = typeof username === 'string' ? accounts[username] : undefined;

    if (!account || account.password !== password) {
      return { error: '로그인 정보를 확인하세요.' };
    }

    if (typeof username !== 'string') {
      return { error: '로그인 정보를 확인하세요.' };
    }

    const user: AuthUser = { username, role: username };
    request.session.user = user;
    return { user };
  }

  @Post('logout')
  async logout(@Req() request: Request): Promise<{ user: null }> {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    return { user: null };
  }
}