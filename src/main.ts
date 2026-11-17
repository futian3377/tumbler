import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { mkdirSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { join } from 'node:path';
import { ApiExceptionFilter } from './api-exception.filter';
import { ApiFallbackController } from './api-fallback.controller';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const runtimeDirectory = join(process.cwd(), 'runtime');
  const uploadsDirectory = join(runtimeDirectory, 'uploads');
  mkdirSync(uploadsDirectory, { recursive: true });
  app.useBodyParser('json', { limit: '50mb' });

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'tumbler-factory-training-session',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    const isApi = request.path === '/api' || request.path.startsWith('/api/');
    if (!isApi) {
      next();
      return;
    }

    const publicEndpoint =
      (request.method === 'GET' && request.path === '/api/session') ||
      (request.method === 'POST' && request.path === '/api/login') ||
      (request.method === 'POST' && request.path === '/api/logout');

    if (publicEndpoint || request.session.user) {
      next();
      return;
    }

    response.status(401).json({ error: '로그인이 필요합니다.' });
  });

  app.use('/uploads', express.static(uploadsDirectory));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.path.startsWith('/api')) {
      next();
      return;
    }

    response.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  app.useGlobalFilters(new ApiExceptionFilter());

  const port = Number(process.env.PORT) || 4185;
  await app.listen(port, '127.0.0.1');
  console.log(`품질 대시보드 서버 실행 중: http://127.0.0.1:${port}`);
  console.log('저장소: 내 컴퓨터(runtime/local-state.json)');
}

void bootstrap();