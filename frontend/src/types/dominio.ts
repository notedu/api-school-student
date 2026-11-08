import type { AccountType } from '../services/clienteApi'

export type Page =
  | 'Visão geral'
  | 'Meu boletim'
  | 'Reavaliações'
  | 'Alunos'
  | 'Matérias'
  | 'Acessos'
  | 'Auditoria'
  | 'Professores'
export type Role = 'Administrador' | 'Professor' | 'Aluno'
export type ModalName =
  | 'grade'
  | 'review'
  | 'student-report'
  | 'team-details'
  | 'recovery'
  | 'student-review'
  | 'student-create'
  | 'teacher-create'
  | 'matter-create'
  | 'change-password'
  | 'temporary-password'
  | null
export type Grade = {
  id?: string
  alunoId?: number
  materiaId?: number
  professorId?: number
  student: string
  ra: string
  subject: string
  title: string
  score: number
  color: string
  teacher: string
  period: string
}
export type Session = {
  id: number
  nome: string
  tipo: AccountType
  deveTrocarSenha: boolean
  cargo?: string
}
export type ReviewRequest = {
  id?: string
  notaId?: string
  student: string
  studentRa?: string
  subject: string
  grade: string
  score: number
  assignedScore?: number | null
  teacherReason?: string | null
  teacherName?: string
  respondedAt?: string | null
  time: string
  state: string
  initials: string
  color: string
  reason: string
  attachments?: { id: string; nomeArquivo: string; tamanhoBytes: number }[]
}
export type StudentOption = { id: number; nome: string; ra: string; cpf?: string }
export type SubjectOption = {
  id: number
  nome: string
  professores: { professor: { id: number; nome: string } }[]
}
export type TeamOption = {
  id: number
  nome: string
  cpf: string
  tipo: 'Professor' | 'Diretor' | 'Coordenador'
}
export type SearchSuggestion =
  | { kind: 'student'; id: number; title: string; detail: string; student: StudentOption }
  | { kind: 'subject'; id: number; title: string; detail: string; subject: SubjectOption }
  | { kind: 'team'; id: number; title: string; detail: string }
export type AuditItem = {
  id: string
  acao: string
  descricao: string
  atorTipo: string
  criadoEm: string
}
export type AuditFilter = 'all' | 'access' | 'student' | 'teacher' | 'subject' | 'grade' | 'review'
export type RecoveryItem = {
  id: string
  tipoConta: AccountType
  identificador: string
  criadaEm: string
  aluno?: { nome: string; ra: string } | null
  professor?: { nome: string; cpf: string } | null
}
export type DashboardStats = {
  alunos: number
  materias: number
  notas: number
  reavaliacoesPendentes: number
}

export const accountType: Record<Role, AccountType> = {
  Administrador: 'ADMIN',
  Professor: 'PROFESSOR',
  Aluno: 'ALUNO',
}
export const displayRole: Record<AccountType, Role> = {
  ADMIN: 'Administrador',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
}
export const periods = ['1º bimestre', '2º bimestre', '3º bimestre', '4º bimestre']
export const assessmentTypes = [
  'Média bimestral consolidada',
  'Prova bimestral',
  'Trabalho',
  'Projeto',
  'Seminário',
  'Pesquisa',
  'Produção textual',
  'Portfólio',
  'Recuperação bimestral',
]
