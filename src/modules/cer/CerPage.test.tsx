import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CerPage } from './CerPage';
import * as cerService from './cerService';
import * as censoService from '../censo/censoService';
import * as coloniasService from '../colonias/coloniasService';
import type { ActuacionCer } from './types';

const MOCK_ACTUACIONES: ActuacionCer[] = [
  {
    id: 'cer-1',
    owner_id: 'user-1',
    gato_id: 'gato-1',
    colonia_id: 'col-1',
    estado: 'intervencion_quirurgica',
    fecha_actuacion: '2026-11-20T10:00:00Z',
    clinica_veterinaria: 'Clínica Veterinaria Tarragona',
    resultado_intervencion: 'Sin complicaciones',
    marcaje_realizado: true,
    observaciones: null,
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    colonia_nombre: 'Colonia Parque Norte',
    created_at: '2026-11-20T10:00:00Z',
    updated_at: '2026-11-20T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'cer-2',
    owner_id: 'user-1',
    gato_id: 'gato-2',
    colonia_id: 'col-1',
    estado: 'retorno_colonia',
    fecha_actuacion: '2026-11-22T18:00:00Z',
    clinica_veterinaria: null,
    resultado_intervencion: null,
    marcaje_realizado: false,
    observaciones: 'Retorno correcto',
    gato_codigo: 'SC-00002',
    gato_nombre: 'Luna',
    colonia_nombre: 'Colonia Parque Norte',
    created_at: '2026-11-22T18:00:00Z',
    updated_at: '2026-11-22T18:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('CerPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista actuaciones CER, filtra por fase y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(cerService, 'listActuacionesCer').mockResolvedValue(MOCK_ACTUACIONES);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    const softDeleteSpy = vi.spyOn(cerService, 'softDeleteActuacionCer').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CerPage />);

    expect(await screen.findByText('Bigotes')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por fase cer/i), 'retorno_colonia');
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.queryByText('Bigotes')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar actuación de luna a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('cer-2');
  });
});