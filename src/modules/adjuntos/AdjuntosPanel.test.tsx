import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdjuntosPanel } from './AdjuntosPanel';
import * as adjuntosService from './adjuntosService';
import type { Adjunto } from './types';

const MOCK_ADJUNTOS: Adjunto[] = [
  {
    id: 'adj-1',
    owner_id: 'user-1',
    entidad: 'gato',
    registro_id: 'gato-1',
    tipo: 'foto',
    nombre_archivo: 'bigotes.jpg',
    mime_type: 'image/jpeg',
    tamano_bytes: 120000,
    storage_path: 'user-1/gato/gato-1/bigotes.jpg',
    es_principal: false,
    signed_url: 'https://example.com/bigotes.jpg',
    created_at: '2026-11-26T10:00:00Z',
    updated_at: '2026-11-26T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'adj-2',
    owner_id: 'user-1',
    entidad: 'gato',
    registro_id: 'gato-1',
    tipo: 'documento',
    nombre_archivo: 'informe-vet.pdf',
    mime_type: 'application/pdf',
    tamano_bytes: 245000,
    storage_path: 'user-1/gato/gato-1/informe-vet.pdf',
    es_principal: false,
    signed_url: 'https://example.com/informe-vet.pdf',
    created_at: '2026-11-26T11:00:00Z',
    updated_at: '2026-11-26T11:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('AdjuntosPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra galería y documentos, permite marcar foto principal y eliminar a papelera', async () => {
    const user = userEvent.setup();
    vi.spyOn(adjuntosService, 'listAdjuntos').mockResolvedValue(MOCK_ADJUNTOS);
    const principalSpy = vi.spyOn(adjuntosService, 'setFotoPrincipal').mockResolvedValue();
    const deleteSpy = vi.spyOn(adjuntosService, 'softDeleteAdjunto').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdjuntosPanel entidad="gato" registroId="gato-1" />);

    expect(await screen.findByText('bigotes.jpg')).toBeInTheDocument();
    expect(screen.getByText('informe-vet.pdf')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /marcar bigotes\.jpg como foto principal/i })
    );
    expect(principalSpy).toHaveBeenCalledWith(MOCK_ADJUNTOS[0]);

    await user.click(screen.getByRole('button', { name: /eliminar informe-vet\.pdf/i }));
    expect(deleteSpy).toHaveBeenCalledWith('adj-2');
  });
});