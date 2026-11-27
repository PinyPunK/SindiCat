import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { LoginPage } from './LoginPage';

vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('LoginPage', () => {
  it('muestra el formulario de inicio de sesión y permite cambiar a recuperación', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /¿olvidaste tu contraseña\?/i }));
    expect(screen.getByRole('button', { name: /enviar enlace de recuperación/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });
});