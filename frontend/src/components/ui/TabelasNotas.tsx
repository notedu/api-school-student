import type { Grade } from '../../types/dominio'
import { canonicalPeriod } from '../../utils/formatadores'
import { Avatar } from './Avatar'

export function GradesTable({
  rows,
  onEdit,
  canEdit,
}: {
  rows: Grade[]
  onEdit: (grade: Grade) => void
  canEdit: boolean
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>ALUNO</th>
            <th>MATÉRIA</th>
            <th>AVALIAÇÃO</th>
            <th>PERÍODO</th>
            <th>NOTA</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.ra}-${row.title}-${index}`}>
              <td>
                <div className="person-cell">
                  <Avatar
                    initials={row.student
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                    color={['lilac', 'mint', 'peach', 'sky', 'yellow'][index % 5]}
                    small
                  />
                  <span>
                    <b>{row.student}</b>
                    <small>RA {row.ra}</small>
                  </span>
                </div>
              </td>
              <td>
                <span className={`table-subject ${row.color}`}>{row.subject}</span>
              </td>
              <td>
                {row.title}
                <small className="cell-secondary"> | {row.teacher}</small>
              </td>
              <td>{row.period}</td>
              <td>
                <span
                  className={`grade-pill ${row.score < 6 ? 'grade-low' : row.score >= 8 ? 'grade-high' : ''}`}
                >
                  {row.score.toFixed(1)}
                </span>
              </td>
              <td>
                {canEdit && (
                  <button
                    className="row-menu"
                    onClick={() => onEdit(row)}
                    aria-label={`Editar nota de ${row.student}`}
                  >
                    •••
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="empty-state">Nenhuma nota encontrada para essa busca.</div>
      )}
    </div>
  )
}

export function GradeReport({
  rows,
  onEdit,
  canEdit,
}: {
  rows: Grade[]
  onEdit: (grade: Grade) => void
  canEdit: boolean
}) {
  const periods = ['1º bimestre', '2º bimestre', '3º bimestre', '4º bimestre']
  const subjectGroups = Array.from(
    rows
      .reduce((groups, grade) => {
        const key = grade.materiaId ?? grade.subject
        groups.set(key, [...(groups.get(key) ?? []), grade])
        return groups
      }, new Map<number | string, Grade[]>())
      .values(),
  )

  if (subjectGroups.length === 0)
    return <div className="empty-state">Ainda não há notas bimestrais lançadas.</div>

  return (
    <div className="table-scroll">
      <table className="report-table">
        <thead>
          <tr>
            <th>MATÉRIA</th>
            {periods.map((period) => (
              <th key={period}>{period}</th>
            ))}
            <th>MÉDIA ANUAL</th>
            <th>SITUAÇÃO</th>
          </tr>
        </thead>
        <tbody>
          {subjectGroups.map((subjectGrades) => {
            const bimestreGrades = periods.map((period) =>
              subjectGrades.find((grade) => canonicalPeriod(grade.period) === period),
            )
            const recordedGrades = bimestreGrades.filter((grade): grade is Grade => Boolean(grade))
            const average =
              recordedGrades.reduce((sum, grade) => sum + grade.score, 0) / recordedGrades.length
            const complete = recordedGrades.length === periods.length
            const result = complete ? (average >= 6 ? 'Aprovado' : 'Reprovado') : 'Em andamento'
            return (
              <tr key={subjectGrades[0].materiaId ?? subjectGrades[0].subject}>
                <td>
                  <b>{subjectGrades[0].subject}</b>
                </td>
                {bimestreGrades.map((grade, index) => (
                  <td key={periods[index]}>
                    {grade ? (
                      canEdit ? (
                        <button
                          className={`grade-pill ${grade.score < 6 ? 'grade-low' : grade.score >= 8 ? 'grade-high' : ''}`}
                          onClick={() => onEdit(grade)}
                          aria-label={`Editar nota de ${periods[index]}`}
                        >
                          {grade.score.toFixed(1)}
                        </button>
                      ) : (
                        <span
                          className={`grade-pill ${grade.score < 6 ? 'grade-low' : grade.score >= 8 ? 'grade-high' : ''}`}
                        >
                          {grade.score.toFixed(1)}
                        </span>
                      )
                    ) : (
                      <span className="missing-grade">—</span>
                    )}
                  </td>
                ))}
                <td>
                  <strong>{complete ? average.toFixed(1) : `${average.toFixed(1)}*`}</strong>
                </td>
                <td>
                  <span
                    className={`report-status ${complete ? (average >= 6 ? 'report-approved' : 'report-failed') : ''}`}
                  >
                    {result}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
