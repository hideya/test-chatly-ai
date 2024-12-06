import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';
import { renderWithProviders } from './test-utils';

// useUserのモックを作成
vi.mock('../hooks/use-user', () => ({
  useUser: () => ({
    user: null,
    error: null,
    isLoading: false,
  }),
}));

describe('AuthPage', () => {
  it('renders authentication page correctly', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays login form', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
