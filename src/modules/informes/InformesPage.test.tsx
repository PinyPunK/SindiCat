import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InformesPage } from './InformesPage';
import * as informesService from './informesService';
import * as exportService from './exportService';
import * as coloniasService from '../colonias/coloniasService';
import * as censoService from '../censo/censoService';

describe('InformesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('genera PDF y exporta CSV con las opciones seleccionadas', async () => {
    const user = userEvent.setup();
    vi.spyOn(informesService, 'getInformesConteos').mockResolvedValue({
      colonias: 2,
      gatos: 12,
      actuacionesCer: 9,
      registrosVet: 5,
      incidencias: 3,
    });
    vi.spyOn(coloniasService, 'listColonias').mockResolvedValue([]);
    vi.spyOn(censoService, 'listGatos').mockResolvedValue([]);
    const pdfSpy = vi
      .spyOn(exportService, 'generarInformePdf')
      .mockResolvedValue('SindiCat_censo_general_2026-11-27.pdf');
    const csvSpy = vi
      .spyOn(exportService, 'exportarInformeCsv')
      .mockResolvedValue('SindiCat_censo_general_2026-11-27.csv');

    render(<InformesPage />);

    expect(await screen.findByText('Centro de informes')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/orientación de página/i), 'horizontal');
    await user.click(screen.getByRole('button', { name: /generar pdf/i }));

    expect(pdfSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'censo_general',
        orientacion: 'horizontal',
        incluirFotos: true,
      })
    );
    expect(await screen.findByRole('status')).toHaveTextContent(/SindiCat_censo_general_2026-11-27\.pdf/i);

    await user.click(screen.getByRole('button', { name: /exportar excel \/ csv/i }));
    expect(csvSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'censo_general',
        orientacion: 'horizontal',
      })
    );
  });
});