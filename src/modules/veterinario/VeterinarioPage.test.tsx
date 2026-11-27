import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VeterinarioPage } from './VeterinarioPage';
import * as vetService from './veterinarioService';
import * as censoService from '../censo/censoService';
import type { RegistroVeterinario } from './types';

const MOCK_REGISTROS: RegistroVeterinario[] = [
  {
    id: 'vet-1',
    owner_id: 'user-1',
    gato_id: 'gato-1',
    tipo: 'vacunacion',
    fecha: '2026-11-15',
    clinica_veterinaria: 'Clínica Veterinaria',
    diagnostico_o_motivo: 'Vacuna trivalente',
    tratamiento: 'Dosis anual',
    evolucion_resultado: 'Correcta',
    coste: 35,
    requiere_seguimiento: false,
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    created_at: '2026-11-15T10:00:00Z',
    updated_at: '2026-11-15T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'vet-2',
    owner_id: 'user-1',
    gato_id: 'gato-2',
    tipo: 'curacion',
    fecha: '2026-11-24',
    clinica_veterinaria: 'Clínica Veterinaria',
    diagnostico_o_motivo: 'Cura de herida superficial',
    tratamiento: 'Antibiótico 7 días',
    evolucion_resultado: 'En observación',
    coste: 48.5,
    requiere_seguimiento: true,
    gato_codigo: 'SC-00002',
    gato_nombre: 'Luna',
    created_at: '2026-11-24T10:00:00Z',
    updated_at: '2026-11-24T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('VeterinarioPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista registros veterinarios, filtra por seguimiento y envía a papelera', async () => {
    const user = userEvent.setup();
    vi.spyOn(vetService, 'listRegistrosVeterinarios').mockResolvedValue(MOCK_REGISTROS);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const softDeleteSpy = vi.spyOn(vetService, 'softDeleteRegistroVeterinario').mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<VeterinarioPage />);

    expect(await screen.findByText('Vacuna trivalente')).toBeInTheDocument();
    expect(screen.getByText('Cura de herida superficial')).toBeInTheDocument();

    await user.click(screen.getByLabelText(/solo con seguimiento activo/i));
    expect(screen.getByText('Cura de herida superficial')).toBeInTheDocument();
    expect(screen.queryByText('Vacuna trivalente')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar registro de luna a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('vet-2');
  });
});