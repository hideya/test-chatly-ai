import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { setupAuth } from '../auth';
import type { User } from '@db/schema';

describe('Auth API', () => {
  const app = express();
  let agent: request.SuperAgentTest;
  
  beforeAll(() => {
    // Setup minimal express configuration for tests
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Setup auth routes
    setupAuth(app);
  });

  beforeEach(() => {
    agent = request.agent(app);
  });

  describe('Login', () => {
    it('has login endpoint', async () => {
      const response = await request(app).post('/api/auth/login');
      expect(response.status).toBe(401); // Without credentials, should return 401
    });
  });

  describe('Registration', () => {
    it('successfully registers a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Logout', () => {
    it('successfully logs out user', async () => {
      // Register and login
      await agent
        .post('/api/auth/register')
        .send({
          username: 'logouttest',
          password: 'testpass123'
        });

      await agent
        .post('/api/auth/login')
        .send({
          username: 'logouttest',
          password: 'testpass123'
        });

      // Verify logged in
      const preLogoutResponse = await agent.get('/api/auth/user');
      expect(preLogoutResponse.status).toBe(200);

      // Logout
      const logoutResponse = await agent.post('/api/auth/logout');
      expect(logoutResponse.status).toBe(200);

      // Verify logged out
      const postLogoutResponse = await agent.get('/api/auth/user');
      expect(postLogoutResponse.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    it('maintains user session across requests', async () => {
      // Register and login
      await agent
        .post('/api/auth/register')
        .send({
          username: 'sessiontest',
          password: 'testpass123'
        });

      await agent
        .post('/api/auth/login')
        .send({
          username: 'sessiontest',
          password: 'testpass123'
        });

      // Make multiple requests to verify session
      const responses = await Promise.all([
        agent.get('/api/auth/user'),
        agent.get('/api/auth/user'),
        agent.get('/api/auth/user')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('sessiontest');
      });
    });
  });
});
