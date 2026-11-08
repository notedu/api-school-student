import { api, clearToken, saveToken } from './clienteApi'
import type { AccountType } from './clienteApi'
import type { Session } from '../types/dominio'

export const authService = {
  current: () => api<{ usuario: Session }>('/auth/me'),
  async login(identificador: string, password: string, tipoConta: AccountType) {
    const result = await api<{ token: string; usuario: Session }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identificador, password, tipoConta }),
    })
    saveToken(result.token)
    return result
  },
  changePassword: (senhaAtual: FormDataEntryValue | null, novaSenha: FormDataEntryValue | null) =>
    api('/auth/senha', { method: 'POST', body: JSON.stringify({ senhaAtual, novaSenha }) }),
  requestRecovery: (tipoConta: AccountType, identificador: string) =>
    api('/auth/recuperacao', {
      method: 'POST',
      body: JSON.stringify({ tipoConta, identificador }),
    }),
  clear: clearToken,
}
