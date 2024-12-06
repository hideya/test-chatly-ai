import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChat } from '../hooks/use-chat';
import { renderWithProviders } from './test-utils';
import type { Thread, Message } from "@db/schema";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useChat Hook', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches threads on mount', async () => {
    const mockThreads: Thread[] = [
      {
        id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockThreads)
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await waitFor(() => {
      expect(result.current.threads).toEqual(mockThreads);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/threads');
  });

  it('creates a new thread', async () => {
    const mockThread: Thread = {
      id: 1,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockThread)
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await result.current.createThread('Hello, ChatGPT!');

    expect(mockFetch).toHaveBeenCalledWith('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, ChatGPT!' })
    });
  });

  it('sends a message to a thread', async () => {
    const mockMessage: Message = {
      id: 1,
      thread_id: 1,
      content: 'Test message',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMessage)
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await result.current.sendMessage({ threadId: 1, message: 'Test message' });

    expect(mockFetch).toHaveBeenCalledWith('/api/threads/1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test message' })
    });
  });

  it('deletes a thread', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await result.current.deleteThread(1);

    expect(mockFetch).toHaveBeenCalledWith('/api/threads/1', {
      method: 'DELETE'
    });
  });

  it('handles fetch threads error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await waitFor(() => {
      expect(result.current.threads).toEqual([]);
    });
  });

  it('handles message sending error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const { result } = renderHook(() => useChat(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await expect(
      result.current.sendMessage({ threadId: 1, message: 'Test message' })
    ).rejects.toThrow('Failed to send message');
  });
});
