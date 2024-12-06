import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '../pages/AuthPage';
import { renderWithProviders } from './test-utils';
import { useUser } from '../hooks/use-user';

vi.mock('../hooks/use-user', () => ({
  useUser: vi.fn()
}));

describe('AuthPage', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      error: null,
      isLoading: false,
      login: mockLogin,
      register: mockRegister,
    });
  });

  it('renders authentication page correctly', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
  });

  it('displays login form with required fields', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  it('switches between login and register modes', async () => {
    renderWithProviders(<AuthPage />);
    
    // Initially in login mode
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    
    // Switch to register mode
    const switchButton = screen.getByText(/Don't have an account\? Register/i);
    await userEvent.click(switchButton);
    
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    mockLogin.mockResolvedValueOnce({ ok: true });
    renderWithProviders(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('handles registration submission', async () => {
    mockRegister.mockResolvedValueOnce({ ok: true });
    renderWithProviders(<AuthPage />);

    // Switch to register mode
    await userEvent.click(screen.getByText(/Don't have an account\? Register/i));

    await userEvent.type(screen.getByLabelText(/Username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /^Register$/i }));

    expect(mockRegister).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'password123',
    });
  });

  it('displays loading state during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderWithProviders(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText(/Logging in\.\.\./i)).toBeInTheDocument();
  });

  it('handles login error', async () => {
    mockLogin.mockResolvedValueOnce({ ok: false, message: 'Invalid credentials' });
    renderWithProviders(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'wrongpassword'
      });
    });
  });
});