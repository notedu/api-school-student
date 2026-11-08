import type { TeamOption } from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'

export function TeachersPage({
  team,
  onCreateTeacher,
  onView,
}: {
  team: TeamOption[]
  onCreateTeacher: () => void
  onView: (member: TeamOption) => void
}) {
  const teachers = team.filter((member) => member.tipo === 'Professor')
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Professores</h2>
          <p>Equipe docente e matérias atribuídas</p>
        </div>
        <button className="primary" onClick={onCreateTeacher}>
          <Icon name="plus" size={16} /> Cadastrar professor
        </button>
      </div>
      {teachers.map((teacher) => (
        <button
          className="student-row teacher-row"
          key={teacher.id}
          onClick={() => onView(teacher)}
        >
          <Avatar
            initials={teacher.nome
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
            color="lilac"
          />
          <span>
            <b>{teacher.nome}</b>
            <small>Professor · CPF {teacher.cpf}</small>
          </span>
          <Icon name="arrow" size={16} />
        </button>
      ))}
      {teachers.length === 0 && <div className="empty-state">Nenhum professor cadastrado.</div>}
    </section>
  )
}
