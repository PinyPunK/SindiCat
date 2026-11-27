import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgendaPage } from './AgendaPage';
import * as agendaService from './agendaService';
import * as coloniasService from '../colonias/coloniasService';
import * as censoService from '../censo/censoService';
import type { Recordatorio } from './types';

const MOCK_RECORDATORIOS: Recordatorio[] = [
  {
    id: 'ag-1',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: 'gato-1',
    titulo: 'Revisión puntos postoperatorio',
    tipo: 'revision_veterinaria',
    fecha_recordatorio: '2026-12-05T10:00:00Z',
    prioridad: 'alta',
    completado: false,
    notas: 'Llevar cartilla',
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    created_at: '2026-11-26T10:00:00Z',
    updated_at: '2026-11-26T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'ag-2',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    gato_id: null,
    titulo: 'Comprar sacos de pienso',
    tipo: 'alimentacion',
    fecha_recordatorio: '2026-11-20T09:00:00Z',
    prioridad: 'baja',
    completado: true,
    notas: null,
    colonia_nombre: 'Colonia Parque Norte',
    gato_codigo: null,
    gato_nombre: null,
    created_at: '2026-11-18T10:00:00Z',
    updated_at: '2026-11-20T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('AgendaPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra recordatorios pendientes, permite completarlos y enviarlos a papelera', async () => {
    const user = userEvent.setup();
    vi.spyOn(agendaService, 'listRecordatorios').mockResolvedValue(MOCK_RECORDATORIOS);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const toggleSpy = vi
      .spyOn(agendaService, 'toggleRecordatorioCompletado')
      .mockResolvedValue();
    const softDeleteSpy = vi
      .spyOn(agendaService, 'softDeleteRecordatorio')
      .mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AgendaPage />);

    expect(await screen.findByText('Revisión puntos postoperatorio')).toBeInTheDocument();
    expect(screen.queryByText('Comprar sacos de pienso')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /marcar revisión puntos postoperatorio como completado/i })
    );
    expect(toggleSpy).toHaveBeenCalledWith('ag-1', true);

    await user.click(
      screen.getByRole('button', { name: /enviar recordatorio revisión puntos postoperatorio a papelera/i })
    );
    expect(softDeleteSpy).toHaveBeenCalledWith('ag-1');
  });
});