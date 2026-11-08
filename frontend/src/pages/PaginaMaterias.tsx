import type { Role, SubjectOption } from '../types/dominio'
import { Icon } from '../components/ui/icone'

export function SubjectsPage({
  subjects,
  role,
  onCreateSubject,
  onNavigateTeachers,
}: {
  subjects: SubjectOption[]
  role: Role
  onCreateSubject: () => void
  onNavigateTeachers: () => void
}) {
  return (
    <>
      <div className="panel-heading subject-page-head">
        <div>
          <h2>Matérias da escola</h2>
          <p>Professores e vínculos de ensino</p>
        </div>
        {role === 'Administrador' && (
          <div className="welcome-actions">
            <button className="secondary" onClick={onCreateSubject}>
              <Icon name="plus" size={16} /> Nova matéria
            </button>
            <button className="primary" onClick={onNavigateTeachers}>
              Professores
            </button>
          </div>
        )}
      </div>
      <section className="subject-cards">
        {subjects.map((subject, index) => (
          <div className="panel subject-card" key={subject.id}>
            <div
              className={`subject-icon ${['violet', 'green', 'gold', 'pink', 'blue', 'orange'][index % 6]}`}
            >
              {subject.nome.slice(0, 2).toUpperCase()}
            </div>
            <span className="subject-tag">ATIVA</span>
            <h2>{subject.nome}</h2>
            <p>
              {subject.professores.map(({ professor }) => professor.nome).join(', ') ||
                'Sem professor atribuído'}
            </p>
          </div>
        ))}
      </section>
      {subjects.length === 0 && <div className="empty-state">Nenhuma matéria cadastrada.</div>}
    </>
  )
}
