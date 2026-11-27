import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColoniasPage } from './ColoniasPage';
import * as coloniasService from './coloniasService';
import type { Colonia } from './types';

const MOCK_COLONIAS: Colonia[] = [
  {
    id: 'col-1',
    owner_id: 'user-1',
    codigo: 'COL-001',
    nombre: 'Colonia Parque Norte',
    municipio: 'Tarragona',
    barrio: 'Sant Pere i Sant Pau',
    direccion: 'Av. Principal 10',
    latitud: 41.13,
    longitud: 1.25,
    foto_principal_path: null,
    fecha_registro: '2026-11-01',
    alimentadores: 'Lorena',
    observaciones: null,
    estado: 'activa',
    total_gatos: 8,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'col-2',
    owner_id: 'user-1',
    codigo: 'COL-002',
    nombre: 'Colonia Puerto',
    municipio: 'Tarragona',
    barrio: 'Serrallo',
    direccion: null,
    latitud: null,
    longitud: null,
    foto_principal_path: null,
    fecha_registro: '2026-10-15',
    alimentadores: null,
    observaciones: null,
    estado: 'inactiva',
    total_gatos: 0,
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('ColoniasPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista colonias, filtra por estado y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue(MOCK_COLONIAS);
    const softDeleteSpy = vi.spyOn(coloniasService, 'softDeleteColonia').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ColoniasPage />);

    expect(await screen.findByText('Colonia Parque Norte')).toBeInTheDocument();
    expect(screen.getByText('Colonia Puerto')).toBeInTheDocument();
    expect(screen.getByText('8 gatos registrados')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por estado/i), 'activa');
    expect(screen.getByText('Colonia Parque Norte')).toBeInTheDocument();
    expect(screen.queryByText('Colonia Puerto')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar colonia parque norte a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('col-1');
  });
});