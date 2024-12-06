import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Auth API', () => {
  it('has login endpoint', async () => {
    const response = await request(app).post('/api/auth/login');
    expect(response.status).not.toBe(404);
  });

  it('fails with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    expect(response.status).toBe(401);
  });
});
