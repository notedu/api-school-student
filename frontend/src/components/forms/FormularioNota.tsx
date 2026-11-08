import type { FormEvent } from 'react'
import type { Grade, Role, StudentOption, SubjectOption } from '../../types/dominio'
import { assessmentTypes } from '../../types/dominio'

export type GradeFormProps = {
  students: StudentOption[]
  subjects: SubjectOption[]
  role: Role
  editingGrade: Grade | null
  gradeStudentId: number | null
  setGradeStudentId: (id: number | null) => void
  selectedMateriaId: number | null
  setSelectedMateriaId: (id: number | null) => void
  selectedProfessorId: number | null
  setSelectedProfessorId: (id: number | null) => void
  selectedPeriod: string | null
  setSelectedPeriod: (period: string | null) => void
  availablePeriods: string[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function GradeForm({
  students,
  subjects,
  role,
  editingGrade,
  gradeStudentId,
  setGradeStudentId,
  selectedMateriaId,
  setSelectedMateriaId,
  selectedProfessorId,
  setSelectedProfessorId,
  selectedPeriod,
  setSelectedPeriod,
  availablePeriods,
  onSubmit,
  onCancel,
}: GradeFormProps) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field-block full-span">
        <label className="field-label">Aluno</label>
        {editingGrade ? (
          <input
            className="field"
            value={`${editingGrade.student} · RA ${editingGrade.ra}`}
            readOnly
          />
        ) : (
          <select
            name="student"
            className="field"
            required
            value={gradeStudentId ?? ''}
            onChange={(event) => {
              setGradeStudentId(Number(event.target.value))
              setSelectedMateriaId(null)
              setSelectedProfessorId(null)
              setSelectedPeriod(null)
            }}
          >
            <option value="" disabled>
              Selecione um aluno
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nome} · RA {student.ra}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="field-block">
        <label className="field-label">Matéria</label>
        {editingGrade ? (
          <input className="field" value={editingGrade.subject} readOnly />
        ) : (
          <select
            name="subject"
            className="field"
            required
            disabled={!gradeStudentId}
            value={selectedMateriaId ?? ''}
            onChange={(event) => {
              setSelectedMateriaId(Number(event.target.value))
              setSelectedProfessorId(null)
              setSelectedPeriod(null)
            }}
          >
            <option value="" disabled>
              {gradeStudentId ? 'Selecione' : 'Escolha o aluno primeiro'}
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.nome}
              </option>
            ))}
          </select>
        )}
      </div>
      {role === 'Administrador' && !editingGrade && (
        <div className="field-block">
          <label className="field-label">Professor responsável</label>
          <select
            name="professor"
            className="field"
            required
            disabled={!selectedMateriaId}
            value={selectedProfessorId ?? ''}
            onChange={(event) => setSelectedProfessorId(Number(event.target.value))}
          >
            <option value="" disabled>
              {selectedMateriaId ? 'Selecione' : 'Selecione a matéria primeiro'}
            </option>
            {subjects
              .filter((subject) => subject.id === selectedMateriaId)
              .flatMap((subject) =>
                subject.professores.map(({ professor }) => (
                  <option key={`${subject.id}-${professor.id}`} value={professor.id}>
                    {professor.nome}
                  </option>
                )),
              )}
          </select>
        </div>
      )}
      <div className="field-block">
        <label className="field-label">Nota bimestral (0 a 10)</label>
        <input
          name="score"
          type="number"
          min="0"
          max="10"
          step="1"
          className="field"
          defaultValue={editingGrade?.score ?? 0}
          disabled={!editingGrade && !gradeStudentId}
          required
        />
        <small className="address-status">
          Somente números inteiros; as setas avançam de 1 em 1.
        </small>
      </div>
      <div className="field-block">
        <label className="field-label">Bimestre</label>
        {editingGrade ? (
          <input className="field" value={editingGrade.period} readOnly />
        ) : (
          <select
            name="period"
            className="field"
            required
            disabled={!gradeStudentId || !selectedMateriaId || availablePeriods.length === 0}
            value={selectedPeriod ?? ''}
            onChange={(event) => setSelectedPeriod(event.target.value)}
          >
            <option value="" disabled>
              {!gradeStudentId || !selectedMateriaId
                ? 'Escolha aluno e matéria primeiro'
                : availablePeriods.length
                  ? 'Selecione'
                  : 'Notas lançadas nos 4 bimestres'}
            </option>
            {availablePeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="field-block full-span">
        <label className="field-label">Instrumento avaliativo</label>
        <select
          name="title"
          className="field"
          defaultValue={
            editingGrade && assessmentTypes.includes(editingGrade.title)
              ? editingGrade.title
              : assessmentTypes[0]
          }
          disabled={!editingGrade && !gradeStudentId}
          required
        >
          {assessmentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <small className="address-status">
          O valor registrado continua sendo a síntese final do bimestre.
        </small>
      </div>
      <div className="modal-actions full-span">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="primary">
          {editingGrade ? 'Salvar alterações' : 'Salvar nota'}
        </button>
      </div>
    </form>
  )
}
