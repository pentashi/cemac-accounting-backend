import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser', password: 'testpass', role: 'user' });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  it('/auth/login (POST) should login and return JWT', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'loginuser', password: 'loginpass', role: 'user' });
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'loginuser', password: 'loginpass' });
    expect(res.body).toHaveProperty('access_token');
  });

  afterAll(async () => {
    await app.close();
  });
});
