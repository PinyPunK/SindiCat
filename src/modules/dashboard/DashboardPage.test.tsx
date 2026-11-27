import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import * as dashboardService from './dashboardService';

describe('DashboardPage', () => {
  it('muestra los indicadores principales, próximas capturas y actuaciones recientes', async () => {
    vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValue({
      totalColonias: 4,
      totalGatos: 20,
      machos: 9,
      hembras: 11,
      esterilizados: 15,
      pendientesCer: 5,
      seguimientoVeterinario: 2,
      incidenciasAbiertas: 3,
      proximasCapturas: [
        {
          id: 'cap-1',
          fecha_programada: '2026-11-30T10:00:00Z',
          ubicacion_texto: 'Colonia Parque Central',
          resultado: 'planificada',
        },
      ],
      actuacionesRecientes: [
        {
          id: 'cer-1',
          estado: 'retorno_colonia',
          fecha_actuacion: '2026-11-25T18:00:00Z',
          observaciones: 'Retornado sin incidencias',
        },
      ],
    });

    render(<DashboardPage />);

    expect(await screen.findByText('Resumen general')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('9 machos · 11 hembras')).toBeInTheDocument();
    expect(screen.getByText('15 esterilizados · 5 pendientes')).toBeInTheDocument();
    expect(screen.getByText('Colonia Parque Central')).toBeInTheDocument();
    expect(screen.getByText('Retorno a la colonia')).toBeInTheDocument();
  });
});