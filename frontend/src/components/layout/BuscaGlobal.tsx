import type { Role, SearchSuggestion } from '../../types/dominio'
import { Icon } from '../ui/icone'

export function GlobalSearch({
  role,
  query,
  onQuery,
  open,
  setOpen,
  suggestions,
  onSelect,
}: {
  role: Role
  query: string
  onQuery: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  suggestions: SearchSuggestion[]
  onSelect: (suggestion: SearchSuggestion) => void
}) {
  return (
    <div className="search-wrap">
      <div className="search-box">
        <Icon name="search" size={17} />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onQuery(event.target.value)
            setOpen(true)
          }}
          placeholder={
            role === 'Aluno' ? 'Buscar nas suas notas...' : 'Buscar aluno, matéria, CPF ou RA...'
          }
        />
      </div>
      {open && query.trim() && (
        <div className="search-suggestions" role="listbox" aria-label="Sugestões de busca">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.kind}-${suggestion.id}`}
              className="suggestion-row"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(suggestion)}
            >
              <span className={`suggestion-icon suggestion-${suggestion.kind}`}>
                <Icon
                  name={
                    suggestion.kind === 'student'
                      ? 'students'
                      : suggestion.kind === 'subject'
                        ? 'subjects'
                        : 'audit'
                  }
                  size={16}
                />
              </span>
              <span>
                <b>{suggestion.title}</b>
                <small>{suggestion.detail}</small>
              </span>
              <small className="suggestion-type">
                {suggestion.kind === 'student'
                  ? 'Aluno'
                  : suggestion.kind === 'subject'
                    ? 'Matéria'
                    : 'Equipe'}
              </small>
            </button>
          ))}
          {suggestions.length === 0 && (
            <p className="suggestion-empty">Nenhum resultado encontrado para “{query}”.</p>
          )}
        </div>
      )}
    </div>
  )
}
