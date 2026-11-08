import type { AuditFilter, AuditItem } from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'
import { auditActionLabel } from '../utils/formatadores'

export function AuditPage({
  logs,
  filter,
  setFilter,
}: {
  logs: AuditItem[]
  filter: AuditFilter
  setFilter: (filter: AuditFilter) => void
}) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Registro de atividades</h2>
          <p>Ações realizadas na plataforma para transparência e acompanhamento</p>
        </div>
        <select
          className="select-compact"
          aria-label="Filtrar registros da auditoria"
          value={filter}
          onChange={(event) => setFilter(event.target.value as AuditFilter)}
        >
          <option value="all">Todas as atividades</option>
          <option value="access">Acessos e senhas</option>
          <option value="student">Alunos cadastrados</option>
          <option value="teacher">Professores cadastrados</option>
          <option value="subject">Matérias</option>
          <option value="grade">Notas</option>
          <option value="review">Reavaliações</option>
        </select>
      </div>
      {logs.map((entry) => (
        <div className="audit-row" key={entry.id}>
          <span className="audit-icon">
            <Icon
              name={
                entry.acao.includes('REAVALIACAO')
                  ? 'check'
                  : entry.acao.startsWith('RECUPERACAO_') || entry.acao === 'SENHA_ALTERADA'
                    ? 'audit'
                    : 'grades'
              }
              size={16}
            />
          </span>
          <span>
            <b>{auditActionLabel(entry.acao)}</b>
            <small>
              {entry.descricao} · Registrado por {entry.atorTipo.toLowerCase()}
            </small>
          </span>
          <time>{new Date(entry.criadoEm).toLocaleString('pt-BR')}</time>
          <Avatar initials={entry.atorTipo.slice(0, 2)} color="lilac" small />
        </div>
      ))}
      {logs.length === 0 && (
        <div className="empty-state">
          {filter === 'all'
            ? 'Nenhum registro de atividade.'
            : 'Nenhum registro encontrado para esse filtro.'}
        </div>
      )}
    </section>
  )
}
