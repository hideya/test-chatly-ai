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
  it('認証ページが正しくレンダリングされる', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('ログインフォームが表示される', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
  });
});
