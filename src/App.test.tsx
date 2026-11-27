import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./lib/supabase/client', () => ({
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

describe('SindiCat - Protección de acceso', () => {
  it('muestra la pantalla de login cuando no hay sesión', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: /sindicat/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});