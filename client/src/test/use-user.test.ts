import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from '../hooks/use-user';
import { renderWithProviders } from './test-utils';
import type { User, InsertUser } from "@db/schema";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useUser Hook', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches user data on mount', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/user', {
      credentials: 'include'
    });
  });

  it('handles login successfully', async () => {
    const loginData: InsertUser = {
      username: 'testuser',
      password: 'password123'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const loginResult = await result.current.login(loginData);

    expect(loginResult).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });
  });

  it('handles login failure', async () => {
    const loginData: InsertUser = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Invalid credentials')
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const loginResult = await result.current.login(loginData);

    expect(loginResult).toEqual({
      ok: false,
      message: 'Invalid credentials'
    });
  });

  it('handles logout successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const logoutResult = await result.current.logout();

    expect(logoutResult).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
  });

  it('handles registration successfully', async () => {
    const registerData: InsertUser = {
      username: 'newuser',
      password: 'password123'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const registerResult = await result.current.register(registerData);

    expect(registerResult).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
      credentials: 'include'
    });
  });

  it('handles server errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => renderWithProviders(children)
    });

    const loginResult = await result.current.login({
      username: 'testuser',
      password: 'password123'
    });

    expect(loginResult).toEqual({
      ok: false,
      message: 'Internal Server Error'
    });
  });
});
