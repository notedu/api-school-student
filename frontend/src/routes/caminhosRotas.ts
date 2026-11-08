import type { Page, Role } from '../types/dominio'

export const pagePaths: Record<Page, string> = {
  'Visão geral': '/dashboard',
  'Meu boletim': '/boletim',
  Reavaliações: '/reavaliacoes',
  Alunos: '/alunos',
  Matérias: '/materias',
  Professores: '/professores',
  Acessos: '/acessos',
  Auditoria: '/auditoria',
}

export const pageAccess: Record<Page, Role[]> = {
  'Visão geral': ['Administrador', 'Professor', 'Aluno'],
  'Meu boletim': ['Aluno'],
  Reavaliações: ['Administrador', 'Professor', 'Aluno'],
  Alunos: ['Administrador', 'Professor'],
  Matérias: ['Administrador', 'Professor'],
  Professores: ['Administrador'],
  Acessos: ['Administrador'],
  Auditoria: ['Administrador'],
}

export function pageFromPath(pathname: string): Page {
  const entry = Object.entries(pagePaths).find(([, path]) => path === pathname)
  return (entry?.[0] as Page | undefined) ?? 'Visão geral'
}

export function studentReportPath(studentId: number) {
  return `/alunos/${studentId}/boletim`
}

export function studentDetailsPath(studentId: number) {
  return `/alunos/${studentId}`
}

export function teacherDetailsPath(teacherId: number) {
  return `/professores/${teacherId}`
}
