import { api } from './clienteApi'

export type TeacherDetails = {
  id: number
  nome: string
  idade: number
  cpf: string
  dataNascimento: string
  cep: string | null
  rua: string
  bairro: string
  cidade: string
  estado: string
  numeroCasa: string
  complemento: string | null
  criadoEm: string
  materias: { materia: { id: number; nome: string; codigo: string; ativa: boolean } }[]
  reavaliacoes: {
    id: string
    motivo: string
    status: string
    valorAnterior: string | number
    valorAtribuido: string | number | null
    motivoRecusa: string | null
    criadoEm: string
    respondidoEm: string | null
    aluno: { id: number; nome: string; ra: string }
    nota: { id: string; titulo: string; periodo: string; materia: { id: number; nome: string } }
  }[]
}

export const teacherService = {
  detail: (id: number) => api<TeacherDetails>(`/professores/${id}`),
  create: (data: Record<string, unknown>) =>
    api('/professores', { method: 'POST', body: JSON.stringify(data) }),
}
