import type { Role, ReviewRequest } from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'

type Props = {
  role: Role
  requests: ReviewRequest[]
  filter: 'all' | 'pending' | 'answered'
  setFilter: (filter: 'all' | 'pending' | 'answered') => void
  search: string
  setSearch: (value: string) => void
  onSelect: (request: ReviewRequest) => void
}

export function ReevaluationsPage({
  role,
  requests,
  filter,
  setFilter,
  search,
  setSearch,
  onSelect,
}: Props) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading review-page-heading">
        <div>
          <h2>{role === 'Aluno' ? 'Suas reavaliações' : 'Solicitações de reavaliação'}</h2>
          <p>
            {role === 'Aluno'
              ? 'Seus pedidos e as respostas dos professores.'
              : 'Pedidos vinculados a uma nota específica'}
          </p>
        </div>
        <div className="review-filter-controls">
          {role !== 'Aluno' && (
            <label className="review-search">
              <Icon name="search" size={15} />
              <input
                aria-label="Pesquisar aluno por nome ou RA"
                placeholder="Pesquisar aluno por nome ou RA"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          )}
          <select
            className="select-compact"
            aria-label="Filtrar reavaliações por status"
            value={filter}
            onChange={(event) => setFilter(event.target.value as Props['filter'])}
          >
            <option value="all">Todas as solicitações</option>
            <option value="pending">Aguardando análise</option>
            <option value="answered">Respondidas</option>
          </select>
        </div>
      </div>
      {requests.map((item) => (
        <button
          className="review-card"
          key={item.id ?? `${item.student}-${item.subject}-${item.time}`}
          onClick={() => onSelect(item)}
        >
          <Avatar initials={item.initials} color={item.color} />
          <div className="review-main">
            <div className="review-title">
              <b>{item.student}</b>
              <span
                className={`status ${item.state === 'Aguardando análise' ? '' : item.state === 'Recusada' ? 'status-rejected' : 'status-done'}`}
              >
                <i />
                {item.state}
              </span>
            </div>
            <p>
              {item.subject} <i>·</i> {item.grade} <i>·</i> Nota{' '}
              <b className="score-low">{item.score.toFixed(1)}</b>
            </p>
            <p className="review-reason">“{item.reason}”</p>
            <small>
              {item.studentRa && (
                <>
                  RA {item.studentRa} <i>·</i>{' '}
                </>
              )}
              {item.time} <i>·</i> {item.attachments?.length ?? 0} comprovantes anexados
            </small>
          </div>
          <Icon name="arrow" size={18} />
        </button>
      ))}
      {requests.length === 0 && (
        <div className="empty-state">
          {search
            ? 'Nenhuma solicitação corresponde à pesquisa.'
            : filter === 'pending'
              ? 'Não há reavaliações aguardando análise.'
              : filter === 'answered'
                ? 'Ainda não há reavaliações respondidas.'
                : role === 'Aluno'
                  ? 'Você ainda não tem solicitações de reavaliação.'
                  : 'Nenhuma solicitação encontrada.'}
        </div>
      )}
    </section>
  )
}
