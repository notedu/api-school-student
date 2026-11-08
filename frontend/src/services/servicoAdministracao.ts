import { api } from './clienteApi'
import type { AuditItem, DashboardStats, RecoveryItem, TeamOption } from '../types/dominio'

export const adminService = {
  dashboard: () => api<DashboardStats>('/dashboard'),
  audit: () => api<AuditItem[]>('/auditoria'),
  recoveryRequests: () => api<RecoveryItem[]>('/recuperacoes'),
  team: () => api<TeamOption[]>('/equipe'),
  resolveRecovery: (id: string, aprovar: boolean) =>
    api<{ senhaTemporaria?: string; message: string }>(`/recuperacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ aprovar }),
    }),
}
