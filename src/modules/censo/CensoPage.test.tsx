import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CensoPage } from './CensoPage';
import * as censoService from './censoService';
import * as coloniasService from '../colonias/coloniasService';
import type { Gato } from './types';

const MOCK_GATOS: Gato[] = [
  {
    id: 'gato-1',
    owner_id: 'user-1',
    codigo: 'SC-00001',
    nombre: 'Bigotes',
    foto_principal_path: null,
    sexo: 'macho',
    edad_estimada: '3 años',
    fecha_nacimiento_estimada: null,
    color: 'Atigrado',
    caracteristicas_fisicas: null,
    colonia_actual_id: 'col-1',
    colonia_nombre: 'Colonia Parque Norte',
    fecha_primera_observacion: '2026-11-01',
    microchip: null,
    marcaje_auricular: true,
    marcaje_detalle: 'Oreja izquierda',
    estado_cer_actual: 'retornado',
    estado_actual: 'en_colonia',
    observaciones: null,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'gato-2',
    owner_id: 'user-1',
    codigo: 'SC-00002',
    nombre: 'Luna',
    foto_principal_path: null,
    sexo: 'hembra',
    edad_estimada: '1 año',
    fecha_nacimiento_estimada: null,
    color: 'Negra',
    caracteristicas_fisicas: null,
    colonia_actual_id: 'col-1',
    colonia_nombre: 'Colonia Parque Norte',
    fecha_primera_observacion: '2026-11-10',
    microchip: null,
    marcaje_auricular: false,
    marcaje_detalle: null,
    estado_cer_actual: 'pendiente',
    estado_actual: 'adoptado',
    observaciones: null,
    created_at: '2026-11-10T10:00:00Z',
    updated_at: '2026-11-10T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('CensoPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista el censo histórico, filtra por estado y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(censoService, 'listGatos').mockResolvedValue(MOCK_GATOS);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    const softDeleteSpy = vi.spyOn(censoService, 'softDeleteGato').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CensoPage />);

    expect(await screen.findByText('Bigotes')).toBeInTheDocument();
    expect(screen.getByText('SC-00001')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por estado actual/i), 'adoptado');
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.queryByText('Bigotes')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar luna a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('gato-2');
  });
});