import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('認証API', () => {
  it('ログインエンドポイントが存在する', async () => {
    const response = await request(app).post('/api/auth/login');
    expect(response.status).not.toBe(404);
  });

  it('無効な認証情報でログインに失敗する', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    expect(response.status).toBe(401);
  });
});
