import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PapeleraPage } from './PapeleraPage';
import * as papeleraService from './papeleraService';

describe('PapeleraPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista elementos eliminados, restaura y exige confirmación explícita para borrado definitivo', async () => {
    const user = userEvent.setup();
    vi.spyOn(papeleraService, 'listPapelera').mockResolvedValue([
      {
        id: 'gato-1',
        tabla: 'gatos',
        entidadLabel: 'Gato (Censo)',
        titulo: 'SC-00001 · Bigotes',
        detalle: 'Estado: en_colonia',
        deleted_at: '2026-11-26T12:00:00Z',
      },
    ]);
    const restoreSpy = vi.spyOn(papeleraService, 'restaurarRegistro').mockResolvedValue();
    const deleteSpy = vi.spyOn(papeleraService, 'eliminarDefinitivamente').mockResolvedValue();
    vi.spyOn(window, 'prompt').mockReturnValue('ELIMINAR');

    render(<PapeleraPage />);

    expect(await screen.findByText('SC-00001 · Bigotes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /restaurar/i }));
    expect(restoreSpy).toHaveBeenCalledWith('gatos', 'gato-1');

    await user.click(
      screen.getByRole('button', { name: /eliminar definitivamente sc-00001 · bigotes/i })
    );
    expect(deleteSpy).toHaveBeenCalledWith('gatos', 'gato-1');
  });
});