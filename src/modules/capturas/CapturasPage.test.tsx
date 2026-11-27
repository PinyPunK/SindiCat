import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CapturasPage } from './CapturasPage';
import * as capturasService from './capturasService';
import * as coloniasService from '../colonias/coloniasService';
import * as censoService from '../censo/censoService';
import type { Captura } from './types';

const MOCK_CAPTURAS: Captura[] = [
  {
    id: 'cap-1',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: 'gato-1',
    fecha_programada: '2026-12-01T08:30:00Z',
    ubicacion_texto: 'Zona contenedores norte',
    latitud: 41.13,
    longitud: 1.25,
    resultado: 'planificada',
    responsable: 'Lorena',
    observaciones: 'Llevar jaula abatible',
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    created_at: '2026-11-26T10:00:00Z',
    updated_at: '2026-11-26T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'cap-2',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: null,
    fecha_programada: '2026-11-20T09:00:00Z',
    ubicacion_texto: 'Acceso garaje',
    latitud: null,
    longitud: null,
    resultado: 'capturado',
    responsable: 'Lorena',
    observaciones: null,
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: null,
    gato_nombre: null,
    created_at: '2026-11-20T09:00:00Z',
    updated_at: '2026-11-20T09:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('CapturasPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista capturas, filtra por resultado y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(capturasService, 'listCapturas').mockResolvedValue(MOCK_CAPTURAS);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const softDeleteSpy = vi.spyOn(capturasService, 'softDeleteCaptura').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CapturasPage />);

    expect(await screen.findByText('Zona contenedores norte')).toBeInTheDocument();
    expect(screen.getByText('Acceso garaje')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por resultado/i), 'planificada');
    expect(screen.getByText('Zona contenedores norte')).toBeInTheDocument();
    expect(screen.queryByText('Acceso garaje')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar captura zona contenedores norte a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('cap-1');
  });
});