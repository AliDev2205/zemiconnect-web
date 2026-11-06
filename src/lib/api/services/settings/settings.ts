import { http } from '@/lib/api/http';
import { isMockMode, MockApiError, runMock } from '@/lib/api/mock';
import { getRoleHint } from '@/lib/auth/session';
import { pushLog } from '@/mocks/logs';
import { mockActor } from '@/mocks/session';
import { readMockSettings, writeMockSettings } from '@/mocks/settings';
import type { ApiResponse } from '@/types/api';
import type { AppSettings } from '@/types/dashboard';

export interface SettingsPayload {
  structure_name: string | null;
  structure_contact: string | null;
}

/*
 * Paramètres (AD5), permission settings.manage (administrateur).
 *   GET /admin/settings
 *   PUT /admin/settings   { structure_name, structure_contact }
 * Le seuil « expire bientôt » (30 jours) est une règle fixe, non modifiable.
 */
export const settingsService = {
  get: async (): Promise<AppSettings> => {
    if (isMockMode()) return runMock(() => readMockSettings());
    const { data } = await http.get<ApiResponse<AppSettings>>('/admin/settings');
    return data.data;
  },

  update: async (payload: SettingsPayload): Promise<AppSettings> => {
    if (isMockMode()) {
      return runMock(() => {
        if (getRoleHint() !== 'admin') throw new MockApiError(403, "Action réservée à l'administrateur.");
        const previous = readMockSettings();
        const next = { ...previous, ...payload };
        writeMockSettings(next);
        const actor = mockActor();
        pushLog({
          actor_name: actor.name,
          actor_role: actor.role,
          action: 'settings.updated',
          resource_type: 'settings',
          resource_label: 'Structure gestionnaire',
          old_values: { structure_name: previous.structure_name, structure_contact: previous.structure_contact },
          new_values: { ...payload },
        });
        return next;
      });
    }
    const { data } = await http.put<ApiResponse<AppSettings>>('/admin/settings', payload);
    return data.data;
  },
};
