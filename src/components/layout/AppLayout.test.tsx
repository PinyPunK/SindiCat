import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from './AppLayout';

describe('AppLayout - Navegación principal', () => {
  it('muestra las secciones principales y cambia de módulo al hacer clic', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AppLayout
        activeModule="dashboard"
        onSelectModule={onSelect}
        userEmail="admin@sindicat.local"
        onSignOut={vi.fn()}
      >
        <div>Contenido de prueba</div>
      </AppLayout>
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Colonias' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Censo felino' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Control CER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Papelera' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Colonias' }));
    expect(onSelect).toHaveBeenCalledWith('colonias');
  });
});