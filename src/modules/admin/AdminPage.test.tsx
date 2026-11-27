import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from './AdminPage';
import * as adminService from './adminService';
import * as backupService from './backupService';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@sindicat.local' },
  }),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el registro de auditoría, filtra por acción y permite descargar copia JSON', async () => {
    const user = userEvent.setup();
    vi.spyOn(adminService, 'listAuditoria').mockResolvedValue([
      {
        id: 'aud-1',
        entidad: 'colonias',
        registro_id: '12345678-aaaa-bbbb-cccc-1234567890ab',
        accion: 'INSERT',
        created_at: '2026-11-26T10:00:00Z',
      },
      {
        id: 'aud-2',
        entidad: 'gatos',
        registro_id: '87654321-aaaa-bbbb-cccc-1234567890ab',
        accion: 'UPDATE',
        created_at: '2026-11-26T11:00:00Z',
      },
    ]);
    vi.spyOn(backupService, 'getUltimoSnapshotLocal').mockResolvedValue(null);
    const exportSpy = vi.spyOn(backupService, 'exportarBackupCompleto').mockResolvedValue({
      filename: 'SindiCat_Backup_2026-11-27.json',
      totalRegistros: 15,
    });

    render(<AdminPage />);

    expect(await screen.findByText('colonias')).toBeInTheDocument();
    expect(screen.getByText('gatos')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/filtrar auditoría por acción/i), 'INSERT');
    expect(screen.getByText('colonias')).toBeInTheDocument();
    expect(screen.queryByText('gatos')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /descargar copia \(json\)/i }));
    expect(exportSpy).toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent(/SindiCat_Backup_2026-11-27\.json/i);
  });
});