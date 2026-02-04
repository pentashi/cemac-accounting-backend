import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) and /auth/login (POST)', async () => {
    const username = 'testuser';
    const password = 'testpass';
    // Register
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('id');

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password });
    expect(loginRes.status).toBe(201);
    expect(loginRes.body).toHaveProperty('access_token');
  });
});
