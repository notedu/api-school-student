import type { Page, Role, ReviewRequest, Session } from '../../types/dominio'
import { Avatar } from '../ui/Avatar'
import { Brand } from '../ui/Marca'
import { Icon } from '../ui/icone'

export function Sidebar({
  role,
  page,
  pages,
  user,
  pendingReviews,
  accessCount,
  onNavigate,
  onLogout,
}: {
  role: Role
  page: Page
  pages: Page[]
  user: Session | null
  pendingReviews: ReviewRequest[]
  accessCount: number
  onNavigate: (page: Page) => void
  onLogout: () => void
}) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav>
        {pages.map((item) => (
          <button
            key={item}
            onClick={() => onNavigate(item)}
            className={`nav-item ${page === item ? 'nav-active' : ''}`}
          >
            <Icon
              name={
                item === 'Visão geral'
                  ? 'overview'
                  : item === 'Meu boletim'
                    ? 'grades'
                    : item === 'Reavaliações'
                      ? 'review'
                      : item === 'Alunos'
                        ? 'students'
                        : item === 'Matérias'
                          ? 'subjects'
                          : item === 'Professores'
                            ? 'students'
                            : 'audit'
              }
            />
            <span>{item}</span>
            {item === 'Reavaliações' && pendingReviews.length > 0 && (
              <i className="nav-count">{pendingReviews.length}</i>
            )}
            {item === 'Acessos' && accessCount > 0 && <i className="nav-count">{accessCount}</i>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="profile" onClick={onLogout}>
          <Avatar
            initials={
              user?.nome
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2) ?? 'US'
            }
            color="lilac"
            small
          />
          <span>
            <b>{user?.nome ?? 'Usuário'}</b>
            <small>{user?.cargo ?? role}</small>
          </span>
          <Icon name="logout" size={15} />
        </button>
      </div>
    </aside>
  )
}
