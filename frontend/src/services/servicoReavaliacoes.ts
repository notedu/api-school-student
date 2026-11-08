import { api, downloadFile } from './clienteApi'

export type ReviewRecord = {
  id: string
  aluno: { nome: string; ra: string }
  professor: { nome: string }
  nota: { id: string; titulo: string; valor: string | number; materia: { nome: string } }
  motivo: string
  status: string
  valorAnterior: string | number
  valorAtribuido: string | number | null
  motivoRecusa: string | null
  respondidoEm: string | null
  criadoEm: string
  anexos: { id: string; nomeArquivo: string; tamanhoBytes: number }[]
}
export type EvidenceUpload = { nomeArquivo: string; tipoConteudo: string; base64: string }

export const reviewService = {
  list: () => api<ReviewRecord[]>('/reavaliacoes'),
  create: (notaId: string, motivo: FormDataEntryValue | null, anexos: EvidenceUpload[]) =>
    api('/reavaliacoes', { method: 'POST', body: JSON.stringify({ notaId, motivo, anexos }) }),
  respond: (
    id: string,
    aprovar: boolean,
    valor: number | undefined,
    motivoRecusa: FormDataEntryValue | undefined,
    cpf: FormDataEntryValue | null,
    password: FormDataEntryValue | null,
  ) =>
    api(`/reavaliacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ aprovar, valor, motivoRecusa, cpf, password }),
    }),
  downloadEvidence: (id: string, filename: string) =>
    downloadFile(`/reavaliacoes/anexos/${id}`, filename),
}
