import { periods } from '../types/dominio'

export function canonicalPeriod(value: string) {
  const match = value.match(/(?:^|\D)([1-4])(?:\D|$)/)
  return match ? periods[Number(match[1]) - 1] : value.trim().toLowerCase()
}

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
}

export function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

export function auditCategory(
  action: string,
): 'access' | 'student' | 'teacher' | 'subject' | 'grade' | 'review' | null {
  if (action.startsWith('RECUPERACAO_') || action === 'SENHA_ALTERADA') return 'access'
  if (action === 'ALUNO_CRIADO') return 'student'
  if (action === 'PROFESSOR_CRIADO') return 'teacher'
  if (action === 'MATERIA_CRIADA') return 'subject'
  if (action.startsWith('NOTA_')) return 'grade'
  if (action.startsWith('REAVALIACAO_')) return 'review'
  return null
}

export function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    ALUNO_CRIADO: 'Aluno cadastrado',
    PROFESSOR_CRIADO: 'Professor cadastrado',
    MATERIA_CRIADA: 'Matéria cadastrada',
    NOTA_CRIADA: 'Nota lançada',
    NOTA_EDITADA: 'Nota atualizada',
    REAVALIACAO_SOLICITADA: 'Reavaliação solicitada',
    REAVALIACAO_APROVADA: 'Reavaliação aprovada',
    REAVALIACAO_RECUSADA: 'Reavaliação recusada',
    RECUPERACAO_SOLICITADA: 'Recuperação de acesso solicitada',
    RECUPERACAO_APROVADA: 'Recuperação de acesso aprovada',
    RECUPERACAO_RECUSADA: 'Recuperação de acesso recusada',
    SENHA_ALTERADA: 'Senha alterada',
  }
  return labels[action] ?? action.replaceAll('_', ' ').toLocaleLowerCase('pt-BR')
}

export function parseBirthDate(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null
  const [day, month, year] = value.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > new Date()
  )
    return null
  const today = new Date()
  const age =
    today.getFullYear() -
    year -
    (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)
      ? 1
      : 0)
  return { iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, age }
}
