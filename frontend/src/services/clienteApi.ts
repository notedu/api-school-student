const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export type AccountType = 'ALUNO' | 'PROFESSOR' | 'ADMIN'

type ApiError = { error?: string }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('caderno_token')
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new Error(
      `Não foi possível conectar à API em ${API_BASE}. Inicie o Back-End e tente novamente.`,
    )
  }
  const body = (await response.json().catch(() => ({}))) as T & ApiError
  if (!response.ok) throw new Error(body.error || 'A solicitação não foi concluída.')
  return body
}

export function saveToken(token: string) {
  localStorage.setItem('caderno_token', token)
}

export function clearToken() {
  localStorage.removeItem('caderno_token')
}

export async function downloadFile(path: string, filename: string) {
  const token = localStorage.getItem('caderno_token')
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('Não foi possível baixar o anexo.')
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}
