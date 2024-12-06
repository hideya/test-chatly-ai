import { expect, beforeEach, afterEach, vi } from 'vitest';

// Setup test environment
import { vi } from 'vitest';

// Reset modules before each test
vi.resetModules();

// Mock OpenAI module
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

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.clearAllMocks();
});
