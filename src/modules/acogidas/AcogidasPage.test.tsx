import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcogidasPage } from './AcogidasPage';
import * as acogidasService from './acogidasService';
import * as censoService from '../censo/censoService';
import type { AcogidaAdopcion } from './types';

const MOCK_ACOGIDAS: AcogidaAdopcion[] = [
  {
    id: 'acog-1',
    owner_id: 'user-1',
    gato_id: 'gato-1',
    tipo: 'acogida',
    estado: 'activa',
    fecha_inicio: '2026-11-20',
    fecha_fin: null,
    persona_destino: 'Casa de acogida Marta',
    telefono_contacto: '600111222',
    seguimiento: 'Postoperatorio sin incidencias',
    gato_codigo: 'SC-00001',
    gato_nombre: 'Bigotes',
    created_at: '2026-11-20T10:00:00Z',
    updated_at: '2026-11-20T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
  {
    id: 'acog-2',
    owner_id: 'user-1',
    gato_id: 'gato-2',
    tipo: 'adopcion',
    estado: 'activa',
    fecha_inicio: '2026-11-10',
    fecha_fin: null,
    persona_destino: 'Familia García',
    telefono_contacto: '600333444',
    seguimiento: 'Adaptada y con contrato firmado',
    gato_codigo: 'SC-00002',
    gato_nombre: 'Luna',
    created_at: '2026-11-10T10:00:00Z',
    updated_at: '2026-11-10T10:00:00Z',
    deleted_at: null,
    revision: 1,
  },
];

describe('AcogidasPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista acogidas y adopciones, filtra por tipo y envía a papelera con confirmación', async () => {
    const user = userEvent.setup();
    vi.spyOn(acogidasService, 'listAcogidasAdopciones').mockResolvedValue(MOCK_ACOGIDAS);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const softDeleteSpy = vi
      .spyOn(acogidasService, 'softDeleteAcogidaAdopcion')
      .mockResolvedValue();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AcogidasPage />);

    expect(await screen.findByText('Casa de acogida Marta')).toBeInTheDocument();
    expect(screen.getByText('Familia García')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar por tipo de acogida/i), 'adopcion');
    expect(screen.getByText('Familia García')).toBeInTheDocument();
    expect(screen.queryByText('Casa de acogida Marta')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enviar registro de luna a papelera/i }));
    expect(softDeleteSpy).toHaveBeenCalledWith('acog-2');
  });
});