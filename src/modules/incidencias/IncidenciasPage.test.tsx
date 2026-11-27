import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncidenciasPage } from './IncidenciasPage';
import * as incidenciasService from './incidenciasService';
import * as coloniasService from '../colonias/coloniasService';
import * as censoService from '../censo/censoService';
import type { Incidencia } from './types';

const MOCK_INCIDENCIAS: Incidencia[] = [
  {
    id: 'inc-1',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: null,
    tipo: 'camadas',
    estado: 'abierta',
    fecha: '2026-11-25',
    descripcion: 'Localizada camada de 3 cachorros junto al muro.',
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: null,
    gato_nombre: null,
    created_at: '2026-11-25T10:00:00Z',
    updated_at: '2026-11-25T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'inc-2',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: 'gato-1',
    tipo: 'problemas_vecinos',
    estado: 'resuelta',
    fecha: '2026-11-18',
    descripcion: 'Aviso vecinal aclarado con normativa municipal.',
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    created_at: '2026-11-18T10:00:00Z',
    updated_at: '2026-11-18T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('IncidenciasPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista incidencias, filtra por estado y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(incidenciasService, 'listIncidencias').mockResolvedValue(MOCK_INCIDENCIAS);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const softDeleteSpy = vi.spyOn(incidenciasService, 'softDeleteIncidencia').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<IncidenciasPage />);

    expect(await screen.findByText(/camada de 3 cachorros/i)).toBeInTheDocument();
    expect(screen.getByText(/aviso vecinal aclarado/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por estado de incidencia/i), 'abierta');
    expect(screen.getByText(/camada de 3 cachorros/i)).toBeInTheDocument();
    expect(screen.queryByText(/aviso vecinal aclarado/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar incidencia camadas a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('inc-1');
  });
});