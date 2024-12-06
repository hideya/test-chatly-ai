import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChat } from '../hooks/use-chat';
import { createWrapper } from './test-utils';
import type { Thread, Message } from "@db/schema";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useChat Hook', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('handles fetch threads error', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        'Internal Server Error',
        { 
          status: 500, 
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'text/plain' }
        }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.threads).toEqual([]);
    });
  });

  it('handles message sending error', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        'Failed to send message',
        { 
          status: 500, 
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'text/plain' }
        }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await expect(
      result.current.sendMessage({ threadId: 1, message: 'Test message' })
    ).rejects.toThrow('Failed to send message');
  });
});