import type { RecoveryItem, ReviewRequest, Role } from '../../types/dominio'
import { Icon } from '../ui/icone'

export function NotificationCenter({
  role,
  pendingReviews,
  accessRequests,
  open,
  setOpen,
  onNavigate,
}: {
  role: Role
  pendingReviews: ReviewRequest[]
  accessRequests: RecoveryItem[]
  open: boolean
  setOpen: (open: boolean) => void
  onNavigate: (page: 'Reavaliações' | 'Acessos') => void
}) {
  const total = pendingReviews.length + (role === 'Administrador' ? accessRequests.length : 0)
  return (
    <div className="notification-wrap">
      <button
        className="icon-button notification"
        aria-label="Notificações"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name="bell" />
        {total > 0 && <i />}
      </button>
      {open && (
        <section className="notification-panel" aria-label="Notificações">
          <div className="notification-heading">
            <div>
              <b>Notificações</b>
              <small>{total} pendentes</small>
            </div>
            <button
              className="notification-close"
              onClick={() => setOpen(false)}
              aria-label="Fechar notificações"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          {pendingReviews.map((request) => (
            <button
              key={`review-${request.id ?? request.student}`}
              className="notification-row"
              onClick={() => {
                setOpen(false)
                onNavigate('Reavaliações')
              }}
            >
              <span className="notification-mark review-mark">
                <Icon name="review" size={16} />
              </span>
              <span>
                <b>{role === 'Aluno' ? 'Seu pedido está em análise' : 'Reavaliação pendente'}</b>
                <small>
                  {role === 'Aluno'
                    ? `${request.subject} · nota ${request.score.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}`
                    : `${request.student} · ${request.subject}`}
                </small>
                <small>{request.time}</small>
              </span>
            </button>
          ))}
          {role === 'Administrador' &&
            accessRequests.map((request) => (
              <button
                key={`access-${request.id}`}
                className="notification-row"
                onClick={() => {
                  setOpen(false)
                  onNavigate('Acessos')
                }}
              >
                <span className="notification-mark access-mark">
                  <Icon name="audit" size={16} />
                </span>
                <span>
                  <b>Pedido de recuperação de acesso</b>
                  <small>
                    {request.aluno?.nome ?? request.professor?.nome ?? request.identificador} ·{' '}
                    {request.tipoConta === 'ALUNO' ? 'Aluno' : 'Professor'}
                  </small>
                  <small>{new Date(request.criadaEm).toLocaleString('pt-BR')}</small>
                </span>
              </button>
            ))}
          {total === 0 && (
            <p className="notification-empty">Você não tem notificações pendentes.</p>
          )}
        </section>
      )}
    </div>
  )
}
