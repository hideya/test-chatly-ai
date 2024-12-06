import '@testing-library/jest-dom';
import { expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Reset mocks
beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
