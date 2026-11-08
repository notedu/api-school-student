import type { Grade } from '../types/dominio'
import { GradeReport } from '../components/ui/TabelasNotas'
import type { GradeFormProps } from '../components/forms/FormularioNota'
import { GradeForm } from '../components/forms/FormularioNota'

export function GradesPage({ rows }: { rows: Grade[] }) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Boletim bimestral</h2>
          <p>
            A média anual é parcial até o lançamento dos quatro bimestres; aprovação a partir de
            6,0.
          </p>
        </div>
      </div>
      <GradeReport rows={rows} canEdit={false} onEdit={() => undefined} />
    </section>
  )
}

export function StudentReportPage({
  studentName,
  ra,
  rows,
  canEdit,
  onEdit,
}: {
  studentName: string
  ra: string
  rows: Grade[]
  canEdit: boolean
  onEdit: (grade: Grade) => void
}) {
  return (
    <section className="panel table-panel full-table">
      <div className="panel-heading">
        <div>
          <h2>Boletim de {studentName}</h2>
          <p>RA {ra} · média anual parcial até os quatro bimestres; aprovação a partir de 6,0.</p>
        </div>
      </div>
      <GradeReport rows={rows} canEdit={canEdit} onEdit={onEdit} />
    </section>
  )
}

export function CreateGradePage({ form }: { form: GradeFormProps }) {
  return (
    <section className="panel table-panel grade-entry-page">
      <div className="panel-heading">
        <div>
          <h2>Lançar nota bimestral</h2>
          <p>Selecione o aluno, a matéria e o bimestre para registrar a nota.</p>
        </div>
      </div>
      <GradeForm {...form} />
    </section>
  )
}
