import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapaPage } from './MapaPage';
import * as mapaService from './mapaService';

describe('MapaPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra aviso de privacidad, lista puntos geolocalizados y filtra por capa', async () => {
    const user = userEvent.setup();
    vi.spyOn(mapaService, 'getMapaResumen').mockResolvedValue({
      coloniasSinGps: 1,
      capturasSinGps: 0,
      puntos: [
        {
          id: 'col-1',
          origenId: '1',
          tipo: 'colonia_activa',
          titulo: 'COL-001 · Parque Norte',
          subtitulo: 'Tarragona',
          latitud: 41.137887,
          longitud: 1.256925,
          totalGatos: 6,
        },
        {
          id: 'cap-1',
          origenId: '2',
          tipo: 'captura',
          titulo: 'Zona contenedores',
          subtitulo: 'Estado: planificada',
          latitud: 41.138,
          longitud: 1.257,
          fecha: '2026-12-01T08:00:00Z',
        },
      ],
    });

    render(<MapaPage />);

    expect(await screen.findByText(/uso estrictamente privado/i)).toBeInTheDocument();
    expect(screen.getByText('COL-001 · Parque Norte')).toBeInTheDocument();
    expect(screen.getByText('Zona contenedores')).toBeInTheDocument();

    await user.click(screen.getByLabelText(/ubicaciones de capturas/i));
    expect(screen.queryByText('Zona contenedores')).not.toBeInTheDocument();
    expect(screen.getByText('COL-001 · Parque Norte')).toBeInTheDocument();
  });
});