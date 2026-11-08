import type { Role, StudentOption } from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'

export function StudentsPage({
  students,
  role,
  onCreateStudent,
  onCreateGrade,
  onOpenReport,
  onOpenDetails,
}: {
  students: StudentOption[]
  role: Role
  onCreateStudent: () => void
  onCreateGrade: () => void
  onOpenReport: (student: StudentOption) => void
  onOpenDetails: (student: StudentOption) => void
}) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Alunos</h2>
          <p>Consulte os cadastros, boletins e notas bimestrais</p>
        </div>
        <div className="welcome-actions">
          {role === 'Administrador' && (
            <button className="secondary" onClick={onCreateStudent}>
              <Icon name="plus" size={16} /> Novo aluno
            </button>
          )}
          <button className="primary" onClick={onCreateGrade}>
            <Icon name="plus" size={16} /> Lançar nota bimestral
          </button>
        </div>
      </div>
      {students.map((student, index) => (
        <div className="student-row" key={student.id}>
          <Avatar
            initials={student.nome
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
            color={['lilac', 'mint', 'peach', 'sky', 'yellow'][index % 5]}
          />
          <span>
            <b>{student.nome}</b>
            <small>RA {student.ra}</small>
          </span>
          <div className="student-row-actions">
            {role === 'Administrador' && (
              <button className="outline-sm" onClick={() => onOpenDetails(student)}>
                Ver ficha
              </button>
            )}
            <button className="outline-sm" onClick={() => onOpenReport(student)}>
              Ver boletim
            </button>
          </div>
        </div>
      ))}
      {students.length === 0 && <div className="empty-state">Nenhum aluno encontrado.</div>}
    </section>
  )
}
