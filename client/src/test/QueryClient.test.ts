import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queryClient } from '../lib/queryClient';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('QueryClient Configuration', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    queryClient.clear();
  });

  it('handles successful API responses', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const result = await queryClient.fetchQuery({
      queryKey: ['/api/test'],
      queryFn: ({ queryKey }) => {
        const [url] = queryKey;
        return fetch(url as string, { credentials: 'include' }).then(res => res.json());
      }
    });

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      credentials: 'include'
    });
  });

  it('handles server errors (500+)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ['/api/test'],
        queryFn: ({ queryKey }) => {
          const [url] = queryKey;
          return fetch(url as string, { credentials: 'include' }).then(res => {
            if (!res.ok) {
              if (res.status >= 500) {
                throw new Error(`${res.status}: ${res.statusText}`);
              }
              return res.text().then(text => {
                throw new Error(`${res.status}: ${text}`);
              });
            }
            return res.json();
          });
        }
      })
    ).rejects.toThrow('500: Internal Server Error');
  });

  it('handles client errors (400-499)', async () => {
    const errorMessage = 'Invalid request';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve(errorMessage)
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ['/api/test'],
        queryFn: ({ queryKey }) => {
          const [url] = queryKey;
          return fetch(url as string, { credentials: 'include' }).then(res => {
            if (!res.ok) {
              if (res.status >= 500) {
                throw new Error(`${res.status}: ${res.statusText}`);
              }
              return res.text().then(text => {
                throw new Error(`${res.status}: ${text}`);
              });
            }
            return res.json();
          });
        }
      })
    ).rejects.toThrow('400: Invalid request');
  });

  it('maintains correct cache behavior', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    // Initial fetch
    await queryClient.fetchQuery({
      queryKey: ['/api/test'],
      queryFn: ({ queryKey }) => {
        const [url] = queryKey;
        return fetch(url as string, { credentials: 'include' }).then(res => res.json());
      }
    });

    // Should use cached data
    const cachedData = queryClient.getQueryData(['/api/test']);
    expect(cachedData).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ['/api/test'] });
    expect(queryClient.getQueryData(['/api/test'])).toBeUndefined();
  });
});
