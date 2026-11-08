import { api } from './clienteApi'
import type { StudentOption } from '../types/dominio'

export type StudentNote = { valor: string | number }
export type StudentRecord = StudentOption & { idade: number; cidade: string; notas: StudentNote[] }
export type StudentDetails = {
  id: number
  nome: string
  idade: number
  cpf: string
  ra: string
  responsavelLegal: string
  dataNascimento: string
  cep: string | null
  rua: string
  bairro: string
  cidade: string
  estado: string
  numeroCasa: string
  complemento: string | null
  criadoEm: string
  notas: {
    id: string
    titulo: string
    periodo: string
    valor: string | number
    materia: { id: number; nome: string; codigo: string }
    professor: { id: number; nome: string }
    reavaliacoes: {
      id: string
      status: string
      valorAnterior: string | number
      valorAtribuido: string | number | null
      motivoRecusa: string | null
      criadoEm: string
      respondidoEm: string | null
    }[]
  }[]
}

export const studentService = {
  list: () => api<StudentRecord[]>('/alunos'),
  detail: (id: number) => api<StudentDetails>(`/alunos/${id}`),
  create: (data: Record<string, unknown>) =>
    api('/alunos', { method: 'POST', body: JSON.stringify(data) }),
}
