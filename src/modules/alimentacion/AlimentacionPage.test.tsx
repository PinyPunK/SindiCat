import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlimentacionPage } from './AlimentacionPage';
import * as alimentacionService from './alimentacionService';
import * as coloniasService from '../colonias/coloniasService';
import type { RegistroAlimentacion } from './types';

const MOCK_REGISTROS: RegistroAlimentacion[] = [
  {
    id: 'alim-1',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    tipo: 'alimentacion',
    fecha: '2026-11-26',
    consumo_pienso_kg: 2,
    agua_repuesta: true,
    limpieza_realizada: true,
    estado_comederos: 'Limpios y completos',
    materiales_existencias: null,
    responsable: 'Lorena',
    observaciones: null,
    colonia_nombre: 'Colonia Parque Norte',
    created_at: '2026-11-26T10:00:00Z',
    updated_at: '2026-11-26T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'alim-2',
    owner_id: 'user-1',
    colonia_id: 'col-1',
    tipo: 'materiales_existencias',
    fecha: '2026-11-24',
    consumo_pienso_kg: null,
    agua_repuesta: false,
    limpieza_realizada: false,
    estado_comederos: null,
    materiales_existencias: 'Quedan 3 sacos de 10 kg',
    responsable: 'Lorena',
    observaciones: 'Pedir latas la próxima semana',
    colonia_nombre: 'Colonia Parque Norte',
    created_at: '2026-11-24T10:00:00Z',
    updated_at: '2026-11-24T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('AlimentacionPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista registros de alimentación, filtra por tipo y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(alimentacionService, 'listRegistrosAlimentacion').mockResolvedValue(MOCK_REGISTROS);
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    const softDeleteSpy = vi
      .spyOn(alimentacionService, 'softDeleteRegistroAlimentacion')
      .mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AlimentacionPage />);

    expect(await screen.findByText(/limpios y completos/i)).toBeInTheDocument();
    expect(screen.getByText(/quedan 3 sacos de 10 kg/i)).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/filtrar por tipo de alimentación/i),
      'materiales_existencias'
    );
    expect(screen.getByText(/quedan 3 sacos de 10 kg/i)).toBeInTheDocument();
    expect(screen.queryByText(/limpios y completos/i)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /enviar registro de materiales y existencias a papelera/i })
    );
    expect(softDeleteSpy).toHaveBeenCalledWith('alim-2');
  });
});