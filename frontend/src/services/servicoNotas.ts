import { api } from './clienteApi'

export type GradeRecord = {
  id: string
  alunoId: number
  materiaId: number
  professorId: number
  valor: string | number
  titulo: string
  periodo: string
  aluno: { nome: string; ra: string }
  materia: { nome: string; cor?: string }
  professor: { nome: string }
}

export const gradeService = {
  list: () => api<GradeRecord[]>('/notas'),
  create: (data: Record<string, unknown>) =>
    api('/notas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    api(`/notas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}
