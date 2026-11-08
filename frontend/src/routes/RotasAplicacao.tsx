import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import type {
  AuditFilter,
  AuditItem,
  DashboardStats,
  Grade,
  Page,
  RecoveryItem,
  ReviewRequest,
  Role,
  StudentOption,
  SubjectOption,
  TeamOption,
} from '../types/dominio'
import { pageAccess } from './caminhosRotas'
import { RequireRole } from './ExigirPerfil'
import { DashboardPage } from '../pages/PaginaVisaoGeral'
import { GradesPage, StudentReportPage } from '../pages/PaginaBoletim'
import { ReevaluationsPage } from '../pages/PaginaReavaliacoes'
import { StudentsPage } from '../pages/PaginaAlunos'
import { SubjectsPage } from '../pages/PaginaMaterias'
import { TeachersPage } from '../pages/PaginaProfessores'
import { AccessRequestsPage } from '../pages/PaginaSolicitacoesAcesso'
import { AuditPage } from '../pages/PaginaAuditoria'
import { CreateGradePage } from '../pages/PaginaBoletim'
import { StudentDetailsPage } from '../pages/PaginaDetalheAluno'
import { TeacherDetailsPage } from '../pages/PaginaDetalheProfessor'
import type { GradeFormProps } from '../components/forms/FormularioNota'

type Props = {
  role: Role
  summary: DashboardStats | null
  averageGrade: string
  studentGrades: Grade[]
  personalSubjects: SubjectOption[]
  grades: Grade[]
  filteredGrades: Grade[]
  requests: ReviewRequest[]
  visibleRequests: ReviewRequest[]
  filteredRequests: ReviewRequest[]
  reviewFilter: 'all' | 'pending' | 'answered'
  setReviewFilter: (value: 'all' | 'pending' | 'answered') => void
  reviewSearch: string
  setReviewSearch: (value: string) => void
  students: StudentOption[]
  filteredStudents: StudentOption[]
  subjects: SubjectOption[]
  recoveryRequests: RecoveryItem[]
  auditLogs: AuditItem[]
  auditFilter: AuditFilter
  setAuditFilter: (value: AuditFilter) => void
  team: TeamOption[]
  onNavigate: (page: Page) => void
  onEditGrade: (grade: Grade) => void
  onSelectReview: (request: ReviewRequest) => void
  onCreateStudent: () => void
  onCreateGrade: () => void
  onOpenStudentReport: (student: StudentOption) => void
  onOpenStudentDetails: (student: StudentOption) => void
  onCreateSubject: () => void
  onCreateTeacher: () => void
  onViewTeamMember: (member: TeamOption) => void
  onResolveRecovery: (id: string, approve: boolean) => void
  gradeForm: GradeFormProps
}

export function AppRoutes(props: Props) {
  const {
    role,
    summary,
    averageGrade,
    studentGrades,
    personalSubjects,
    grades,
    filteredGrades,
    requests,
    visibleRequests,
    filteredRequests,
    reviewFilter,
    setReviewFilter,
    reviewSearch,
    setReviewSearch,
    students,
    filteredStudents,
    subjects,
    recoveryRequests,
    auditLogs,
    auditFilter,
    setAuditFilter,
    team,
    onNavigate,
    onEditGrade,
    onSelectReview,
    onCreateStudent,
    onCreateGrade,
    onOpenStudentReport,
    onOpenStudentDetails,
    onCreateSubject,
    onCreateTeacher,
    onViewTeamMember,
    onResolveRecovery,
    gradeForm,
  } = props
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <RequireRole role={role} allowed={pageAccess['Visão geral']}>
            <DashboardPage
              role={role}
              summary={summary}
              averageGrade={averageGrade}
              studentGrades={studentGrades}
              personalSubjects={personalSubjects}
              grades={grades}
              filteredGrades={filteredGrades}
              requests={requests}
              visibleRequests={visibleRequests}
              onNavigate={onNavigate}
              onEditGrade={onEditGrade}
              onSelectRequest={onSelectReview}
            />
          </RequireRole>
        }
      />
      <Route
        path="/boletim"
        element={
          <RequireRole role={role} allowed={pageAccess['Meu boletim']}>
            <GradesPage rows={grades} />
          </RequireRole>
        }
      />
      <Route
        path="/notas/nova"
        element={
          <RequireRole role={role} allowed={pageAccess.Alunos}>
            <CreateGradePage form={gradeForm} />
          </RequireRole>
        }
      />
      <Route
        path="/reavaliacoes"
        element={
          <RequireRole role={role} allowed={pageAccess.Reavaliações}>
            <ReevaluationsPage
              role={role}
              requests={filteredRequests}
              filter={reviewFilter}
              setFilter={setReviewFilter}
              search={reviewSearch}
              setSearch={setReviewSearch}
              onSelect={onSelectReview}
            />
          </RequireRole>
        }
      />
      <Route
        path="/alunos"
        element={
          <RequireRole role={role} allowed={pageAccess.Alunos}>
            <StudentsPage
              students={filteredStudents}
              role={role}
              onCreateStudent={onCreateStudent}
              onCreateGrade={onCreateGrade}
              onOpenReport={onOpenStudentReport}
              onOpenDetails={onOpenStudentDetails}
            />
          </RequireRole>
        }
      />
      <Route
        path="/alunos/:studentId"
        element={
          <RequireRole role={role} allowed={['Administrador']}>
            <StudentDetailsPage />
          </RequireRole>
        }
      />
      <Route
        path="/alunos/:studentId/boletim"
        element={
          <RequireRole role={role} allowed={pageAccess.Alunos}>
            <StudentReportRoute students={students} grades={grades} onEditGrade={onEditGrade} />
          </RequireRole>
        }
      />
      <Route
        path="/materias"
        element={
          <RequireRole role={role} allowed={pageAccess.Matérias}>
            <SubjectsPage
              subjects={subjects}
              role={role}
              onCreateSubject={onCreateSubject}
              onNavigateTeachers={() => onNavigate('Professores')}
            />
          </RequireRole>
        }
      />
      <Route
        path="/professores"
        element={
          <RequireRole role={role} allowed={pageAccess.Professores}>
            <TeachersPage team={team} onCreateTeacher={onCreateTeacher} onView={onViewTeamMember} />
          </RequireRole>
        }
      />
      <Route
        path="/professores/:teacherId"
        element={
          <RequireRole role={role} allowed={pageAccess.Professores}>
            <TeacherDetailsPage />
          </RequireRole>
        }
      />
      <Route
        path="/acessos"
        element={
          <RequireRole role={role} allowed={pageAccess.Acessos}>
            <AccessRequestsPage requests={recoveryRequests} onResolve={onResolveRecovery} />
          </RequireRole>
        }
      />
      <Route
        path="/auditoria"
        element={
          <RequireRole role={role} allowed={pageAccess.Auditoria}>
            <AuditPage logs={auditLogs} filter={auditFilter} setFilter={setAuditFilter} />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function StudentReportRoute({
  students,
  grades,
  onEditGrade,
}: {
  students: StudentOption[]
  grades: Grade[]
  onEditGrade: (grade: Grade) => void
}) {
  const { studentId } = useParams()
  const student = students.find((item) => item.id === Number(studentId))
  if (!student) return <Navigate to="/alunos" replace />
  return (
    <StudentReportPage
      studentName={student.nome}
      ra={student.ra}
      rows={grades.filter((grade) => grade.alunoId === student.id)}
      canEdit
      onEdit={onEditGrade}
    />
  )
}
