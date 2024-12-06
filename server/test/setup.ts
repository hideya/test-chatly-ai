import { expect, beforeEach, afterEach, vi } from 'vitest';

// Mock database
vi.mock('@neondatabase/serverless', () => ({
  neon: () => ({
    sql: vi.fn(),
  }),
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked OpenAI response',
                role: 'assistant'
              }
            }
          ]
        })
      }
    }
  }))
}));

// Mock environment variables
process.env.SESSION_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.clearAllMocks();
});
