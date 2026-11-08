import type { RecoveryItem } from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'

export function AccessRequestsPage({
  requests,
  onResolve,
}: {
  requests: RecoveryItem[]
  onResolve: (id: string, approve: boolean) => void
}) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Recuperação de acesso</h2>
          <p>Confira e aprove solicitações de alunos e professores</p>
        </div>
        <span className="status">
          <i />
          {requests.length} pendentes
        </span>
      </div>
      {requests.map((request) => (
        <div className="recovery-row" key={request.id}>
          <Avatar
            initials={(request.aluno?.nome ?? request.professor?.nome ?? 'US')
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
            color="lilac"
          />
          <span>
            <b>{request.aluno?.nome ?? request.professor?.nome}</b>
            <small>
              {request.tipoConta === 'ALUNO'
                ? `Aluno · RA ${request.aluno?.ra}`
                : `Professor · CPF ${request.professor?.cpf}`}{' '}
              · {new Date(request.criadaEm).toLocaleString('pt-BR')}
            </small>
          </span>
          <button className="decision-reject" onClick={() => onResolve(request.id, false)}>
            Recusar
          </button>
          <button className="decision-approve" onClick={() => onResolve(request.id, true)}>
            Aprovar e gerar senha
          </button>
        </div>
      ))}
      {requests.length === 0 && <div className="empty-state">Não há solicitações pendentes.</div>}
    </section>
  )
}
