import type { ReactNode } from 'react'
import type {
  Page,
  RecoveryItem,
  ReviewRequest,
  Role,
  SearchSuggestion,
  Session,
} from '../../types/dominio'
import { GlobalSearch } from './BuscaGlobal'
import { NotificationCenter } from './CentralNotificacoes'
import { Sidebar } from './BarraLateral'
import { Icon } from '../ui/icone'

type Props = {
  children: ReactNode
  page: Page
  title: string
  subtitle: string | null
  role: Role
  pages: Page[]
  user: Session | null
  pendingReviews: ReviewRequest[]
  accessRequests: RecoveryItem[]
  query: string
  onQuery: (value: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  suggestions: SearchSuggestion[]
  onSelectSuggestion: (suggestion: SearchSuggestion) => void
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  onNavigate: (page: Page) => void
  onLogout: () => void
  onNewReview: () => void
}

const currentDateLabel = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
  .format(new Date())
  .toLocaleUpperCase('pt-BR')

export function AppLayout({
  children,
  page,
  title,
  subtitle,
  role,
  pages,
  user,
  pendingReviews,
  accessRequests,
  query,
  onQuery,
  searchOpen,
  setSearchOpen,
  suggestions,
  onSelectSuggestion,
  notificationsOpen,
  setNotificationsOpen,
  onNavigate,
  onLogout,
  onNewReview,
}: Props) {
  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        page={page}
        pages={pages}
        user={user}
        pendingReviews={pendingReviews}
        accessCount={accessRequests.length}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Início</span>
            <b>/</b>
            <strong>{title}</strong>
          </div>
          <div className="top-actions">
            <GlobalSearch
              role={role}
              query={query}
              onQuery={onQuery}
              open={searchOpen}
              setOpen={setSearchOpen}
              suggestions={suggestions}
              onSelect={onSelectSuggestion}
            />
            <NotificationCenter
              role={role}
              pendingReviews={pendingReviews}
              accessRequests={accessRequests}
              open={notificationsOpen}
              setOpen={setNotificationsOpen}
              onNavigate={onNavigate}
            />
          </div>
        </header>
        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">
                {currentDateLabel} <span className="eyebrow-line" />
              </p>
              <h1>
                {title === 'Visão geral' ? (
                  <>
                    Olá, {user?.nome.split(' ')[0] ?? 'bem-vindo'} <span className="wave">✳</span>
                  </>
                ) : (
                  title
                )}
              </h1>
              {subtitle && <p className="muted">{subtitle}</p>}
            </div>
            <div className="welcome-actions">
              {role === 'Aluno' && (
                <button className="primary" onClick={onNewReview}>
                  <Icon name="plus" size={17} /> Pedir reavaliação
                </button>
              )}
            </div>
          </section>
          {children}
        </div>
      </main>
    </div>
  )
}
