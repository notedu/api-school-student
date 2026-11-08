import { api } from './clienteApi'
import type { SubjectOption } from '../types/dominio'

export const subjectService = {
  list: () => api<SubjectOption[]>('/materias'),
  create: (nome: FormDataEntryValue | null, codigo: FormDataEntryValue | null) =>
    api('/materias', { method: 'POST', body: JSON.stringify({ nome, codigo }) }),
}
