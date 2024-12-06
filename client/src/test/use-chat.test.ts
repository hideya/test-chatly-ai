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

  it('fetches threads on mount', async () => {
    const mockDate = new Date('2024-12-06T18:10:08.904Z');
    const mockThreads: Thread[] = [
      {
        id: 1,
        created_at: mockDate,
        updated_at: mockDate
      }
    ];

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...mockThreads[0],
          created_at: mockDate.toISOString(),
          updated_at: mockDate.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.threads).toEqual([{
        ...mockThreads[0],
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      }]);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/threads');
  });

  it('creates a new thread', async () => {
    const mockDate = new Date('2024-12-06T18:10:08.904Z');
    const mockThread: Thread = {
      id: 1,
      created_at: mockDate,
      updated_at: mockDate
    };

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...mockThread,
          created_at: mockDate.toISOString(),
          updated_at: mockDate.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await result.current.createThread('Hello, ChatGPT!');

    expect(mockFetch).toHaveBeenCalledWith('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, ChatGPT!' })
    });
  });

  it('sends a message to a thread', async () => {
    const mockDate = new Date('2024-12-06T18:10:08.904Z');
    const mockMessage: Message = {
      id: 1,
      thread_id: 1,
      content: 'Test message',
      role: 'user',
      created_at: mockDate,
      updated_at: mockDate
    };

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...mockMessage,
          created_at: mockDate.toISOString(),
          updated_at: mockDate.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await result.current.sendMessage({ threadId: 1, message: 'Test message' });

    expect(mockFetch).toHaveBeenCalledWith('/api/threads/1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test message' })
    });
  });

  it('deletes a thread', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    await result.current.deleteThread(1);

    expect(mockFetch).toHaveBeenCalledWith('/api/threads/1', {
      method: 'DELETE'
    });
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

    await expect(
      result.current.sendMessage({ threadId: 1, message: 'Test message' })
    ).rejects.toThrow('Failed to send message');
  });
});
