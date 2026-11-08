import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type {
  AuditFilter,
  AuditItem,
  DashboardStats,
  Grade,
  ModalName,
  Page,
  RecoveryItem,
  ReviewRequest,
  Role,
  SearchSuggestion,
  Session,
  StudentOption,
  SubjectOption,
  TeamOption,
} from '../types/dominio'
import { accountType, displayRole, periods } from '../types/dominio'
import {
  auditCategory,
  canonicalPeriod,
  formatCpf,
  normalizeSearch,
  parseBirthDate,
} from '../utils/formatadores'
import { authService } from '../services/servicoAutenticacao'
import { studentService } from '../services/servicoAlunos'
import { subjectService } from '../services/servicoMaterias'
import { teacherService } from '../services/servicoProfessores'
import { gradeService } from '../services/servicoNotas'
import { reviewService } from '../services/servicoReavaliacoes'
import { adminService } from '../services/servicoAdministracao'
import { initialGrades, sampleRequests } from '../services/dadosDemonstracao'
import {
  pageFromPath,
  pagePaths,
  studentDetailsPath,
  studentReportPath,
  teacherDetailsPath,
} from '../routes/caminhosRotas'

export function useSchoolController() {
  const location = useLocation()
  const navigate = useNavigate()
  const isStudentReportRoute = /^\/alunos\/\d+\/boletim$/.test(location.pathname)
  const isStudentDetailsRoute = /^\/alunos\/\d+$/.test(location.pathname)
  const isTeacherDetailsRoute = /^\/professores\/\d+$/.test(location.pathname)
  const isGradeCreateRoute = location.pathname === '/notas/nova'
  const page =
    isStudentReportRoute || isStudentDetailsRoute || isGradeCreateRoute
      ? 'Alunos'
      : isTeacherDetailsRoute
        ? 'Professores'
        : pageFromPath(location.pathname)
  function setPage(nextPage: Page) {
    navigate(pagePaths[nextPage])
  }
  const [role, setRole] = useState<Role>('Administrador')
  const [showLogin, setShowLogin] = useState(true)
  const [sessionUser, setSessionUser] = useState<Session | null>(null)
  const [loginCredentials, setLoginCredentials] = useState<
    Record<Role, { id: string; password: string }>
  >({
    Administrador: { id: '', password: '' },
    Professor: { id: '', password: '' },
    Aluno: { id: '', password: '' },
  })
  const loginId = loginCredentials[role].id
  const loginPassword = loginCredentials[role].password
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [recoveryId, setRecoveryId] = useState('')
  const [query, setQuery] = useState('')
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'answered'>(
    'all',
  )
  const [reviewStudentSearch, setReviewStudentSearch] = useState('')
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('all')
  const [grades, setGrades] = useState(initialGrades)
  const [requests, setRequests] = useState(sampleRequests)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [team, setTeam] = useState<TeamOption[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([])
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryItem[]>([])
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [summary, setSummary] = useState<DashboardStats | null>(null)
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null)
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamOption | null>(null)
  const [gradeStudentId, setGradeStudentId] = useState<number | null>(null)
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | null>(null)
  const [selectedProfessorId, setSelectedProfessorId] = useState<number | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalName>(null)
  const [selectedRequest, setSelectedRequest] = useState<(typeof requests)[number] | null>(null)
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | null>(null)
  const [notice, setNotice] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const visiblePages: Page[] =
    role === 'Aluno'
      ? ['Visão geral', 'Meu boletim', 'Reavaliações']
      : role === 'Professor'
        ? ['Visão geral', 'Reavaliações', 'Alunos']
        : [
            'Visão geral',
            'Reavaliações',
            'Alunos',
            'Matérias',
            'Professores',
            'Acessos',
            'Auditoria',
          ]
  const filteredGrades = useMemo(
    () =>
      grades.filter((g) =>
        `${g.student} ${g.ra} ${g.subject} ${g.title}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [grades, query],
  )
  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        normalizeSearch(
          `${student.nome} ${student.ra} ${student.cpf ?? ''} ${student.cpf ? formatCpf(student.cpf) : ''}`,
        ).includes(normalizeSearch(query)),
      ),
    [students, query],
  )
  const visibleRequests =
    role === 'Aluno'
      ? requests.filter((request) => request.student === sessionUser?.nome)
      : requests
  const pendingReviews = visibleRequests.filter((request) => request.state === 'Aguardando análise')
  const filteredAuditLogs =
    auditFilter === 'all'
      ? auditLogs
      : auditLogs.filter((entry) => auditCategory(entry.acao) === auditFilter)
  const reviewableGrades = grades.filter(
    (grade) =>
      grade.id &&
      grade.score < 6 &&
      !visibleRequests.some(
        (request) =>
          request.notaId === grade.id &&
          (request.state === 'Aguardando análise' || request.state === 'Recusada'),
      ),
  )
  const filteredReviewRequests = useMemo(
    () =>
      visibleRequests.filter((request) => {
        const matchesStatus =
          reviewStatusFilter === 'all' ||
          (reviewStatusFilter === 'pending'
            ? request.state === 'Aguardando análise'
            : request.state !== 'Aguardando análise')
        const search = normalizeSearch(reviewStudentSearch.trim())
        const matchesStudent =
          !search ||
          normalizeSearch(`${request.student} ${request.studentRa ?? ''}`).includes(search) ||
          (search.replace(/\D/g, '').length > 0 &&
            request.studentRa?.replace(/\D/g, '').includes(search.replace(/\D/g, '')))
        return matchesStatus && matchesStudent
      }),
    [visibleRequests, reviewStatusFilter, reviewStudentSearch],
  )
  const studentGrades =
    role === 'Aluno' ? grades.filter((grade) => grade.alunoId === sessionUser?.id) : grades
  const personalSubjects =
    role === 'Aluno'
      ? subjects.filter((subject) => studentGrades.some((grade) => grade.materiaId === subject.id))
      : subjects
  const attributedPeriods = new Set(
    grades
      .filter((grade) => grade.alunoId === gradeStudentId && grade.materiaId === selectedMateriaId)
      .map((grade) => canonicalPeriod(grade.period)),
  )
  const availablePeriods = periods.filter((period) => !attributedPeriods.has(period))
  const dashboardGrades = role === 'Aluno' ? studentGrades : grades
  const averageGrade = dashboardGrades.length
    ? (
        dashboardGrades.reduce((sum, grade) => sum + grade.score, 0) / dashboardGrades.length
      ).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '—'
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const term = normalizeSearch(query.trim())
    if (!term) return []
    const digits = term.replace(/\D/g, '')
    const studentResults: SearchSuggestion[] =
      role === 'Aluno'
        ? []
        : students
            .filter(
              (student) =>
                normalizeSearch(
                  `${student.nome} ${student.ra} ${student.cpf ?? ''} ${student.cpf ? formatCpf(student.cpf) : ''}`,
                ).includes(term) ||
                (digits.length > 0 &&
                  (student.ra.replace(/\D/g, '').includes(digits) ||
                    student.cpf?.replace(/\D/g, '').includes(digits))),
            )
            .slice(0, 4)
            .map((student) => ({
              kind: 'student',
              id: student.id,
              title: student.nome,
              detail: `Aluno · RA ${student.ra}${student.cpf ? ` · CPF ${formatCpf(student.cpf)}` : ''}`,
              student,
            }))
    const visibleSubjectOptions = role === 'Aluno' ? personalSubjects : subjects
    const subjectResults: SearchSuggestion[] = visibleSubjectOptions
      .filter((subject) =>
        normalizeSearch(
          `${subject.nome} ${subject.professores.map(({ professor }) => professor.nome).join(' ')}`,
        ).includes(term),
      )
      .slice(0, 4)
      .map((subject) => ({
        kind: 'subject',
        id: subject.id,
        title: subject.nome,
        detail: subject.professores.map(({ professor }) => professor.nome).join(', ') || 'Matéria',
        subject,
      }))
    const staffResults: SearchSuggestion[] =
      role === 'Administrador'
        ? team
            .filter(
              (person) =>
                normalizeSearch(
                  `${person.nome} ${person.cpf} ${formatCpf(person.cpf)} ${person.tipo}`,
                ).includes(term) ||
                (digits.length > 0 && person.cpf.replace(/\D/g, '').includes(digits)),
            )
            .slice(0, 4)
            .map((person) => ({
              kind: 'team',
              id: person.id,
              title: person.nome,
              detail: `${person.tipo} · CPF ${formatCpf(person.cpf)}`,
            }))
        : []
    return [...studentResults, ...subjectResults, ...staffResults].slice(0, 8)
  }, [query, role, students, subjects, personalSubjects, team])

  useEffect(() => {
    if (!localStorage.getItem('caderno_token')) return
    void authService
      .current()
      .then(({ usuario }) => {
        setSessionUser(usuario)
        setRole(displayRole[usuario.tipo])
        setShowLogin(false)
        if (usuario.deveTrocarSenha) setModal('change-password')
      })
      .catch(() => authService.clear())
  }, [])

  useEffect(() => {
    if (!sessionUser) return
    const notesPromise = gradeService.list()
    const reviewsPromise = reviewService.list()
    const subjectsPromise = subjectService.list()
    const studentsPromise =
      sessionUser.tipo !== 'ALUNO' ? studentService.list() : Promise.resolve([])
    const summaryPromise = adminService.dashboard()
    void Promise.all([
      notesPromise,
      reviewsPromise,
      subjectsPromise,
      studentsPromise,
      summaryPromise,
    ])
      .then(([notes, reviews, subjectsResult, studentsResult, summaryResult]) => {
        setGrades(
          notes.map((note) => ({
            id: note.id,
            alunoId: note.alunoId,
            materiaId: note.materiaId,
            professorId: note.professorId,
            student: note.aluno.nome,
            ra: note.aluno.ra,
            subject: note.materia.nome,
            title: note.titulo,
            score: Number(note.valor),
            color: 'emerald',
            teacher: note.professor.nome,
            period: note.periodo,
          })),
        )
        setRequests(
          reviews.map((request) => ({
            id: request.id,
            notaId: request.nota.id,
            attachments: request.anexos,
            student: request.aluno.nome,
            studentRa: request.aluno.ra,
            subject: request.nota.materia.nome,
            grade: request.nota.titulo,
            score: Number(request.valorAnterior),
            assignedScore: request.valorAtribuido === null ? null : Number(request.valorAtribuido),
            teacherReason: request.motivoRecusa,
            teacherName: request.professor.nome,
            respondedAt: request.respondidoEm,
            time: new Date(request.criadoEm).toLocaleString('pt-BR'),
            state:
              request.status === 'PENDENTE'
                ? 'Aguardando análise'
                : request.status === 'APROVADA'
                  ? 'Aprovada'
                  : 'Recusada',
            initials: request.aluno.nome
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2),
            color: 'mint',
            reason: request.motivo,
          })),
        )
        setSubjects(subjectsResult)
        setStudents(studentsResult)
        setSummary(summaryResult)
      })
      .catch((error: Error) => toast(error.message))
  }, [sessionUser])

  useEffect(() => {
    if (sessionUser?.tipo !== 'ADMIN') return
    void adminService
      .audit()
      .then(setAuditLogs)
      .catch((error: Error) => toast(error.message))
    void adminService
      .recoveryRequests()
      .then(setRecoveryRequests)
      .catch((error: Error) => toast(error.message))
    void adminService
      .team()
      .then(setTeam)
      .catch((error: Error) => toast(error.message))
  }, [sessionUser])

  function toast(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  function updateLoginCredential(field: 'id' | 'password', value: string) {
    setLoginCredentials((current) => ({
      ...current,
      [role]: { ...current[role], [field]: value },
    }))
  }

  function openSuggestion(suggestion: SearchSuggestion) {
    setSearchOpen(false)
    setQuery('')
    if (suggestion.kind === 'student') {
      navigate(
        role === 'Administrador'
          ? studentDetailsPath(suggestion.student.id)
          : studentReportPath(suggestion.student.id),
      )
    } else if (suggestion.kind === 'subject') {
      setPage(role === 'Aluno' ? 'Meu boletim' : 'Matérias')
    } else {
      const member = team.find((person) => person.id === suggestion.id) ?? null
      if (member?.tipo === 'Professor') navigate(teacherDetailsPath(member.id))
      else {
        setSelectedTeamMember(member)
        setModal('team-details')
      }
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginBusy(true)
    setLoginError('')
    try {
      const result = await authService.login(loginId, loginPassword, accountType[role])
      setSessionUser(result.usuario)
      setShowLogin(false)
      setRole(displayRole[result.usuario.tipo])
      if (result.usuario.deveTrocarSenha) setModal('change-password')
      else updateLoginCredential('password', '')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.')
    } finally {
      setLoginBusy(false)
    }
  }

  function logout() {
    authService.clear()
    setSessionUser(null)
    setShowLogin(true)
    setPage('Visão geral')
  }

  async function submitPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('newPassword') !== data.get('confirmPassword')) {
      toast('As senhas digitadas não coincidem.')
      return
    }
    try {
      await authService.changePassword(data.get('currentPassword'), data.get('newPassword'))
      setSessionUser((current) => (current ? { ...current, deveTrocarSenha: false } : current))
      updateLoginCredential('password', '')
      setModal(null)
      toast('Senha definitiva cadastrada')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível atualizar a senha.')
    }
  }

  async function resolveRecovery(id: string, aprovar: boolean) {
    try {
      const result = await adminService.resolveRecovery(id, aprovar)
      setRecoveryRequests((current) => current.filter((request) => request.id !== id))
      if (result.senhaTemporaria) {
        setTemporaryPassword(result.senhaTemporaria)
        setModal('temporary-password')
      } else toast(result.message)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível resolver a solicitação.')
    }
  }

  async function requestRecovery() {
    try {
      if (role === 'Administrador')
        throw new Error(
          'A recuperação de acesso administrativo precisa ser feita por outro administrador.',
        )
      await authService.requestRecovery(accountType[role], recoveryId)
      setModal(null)
      toast('Se os dados estiverem corretos, a solicitação será encaminhada ao administrador.')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível solicitar recuperação.')
    }
  }

  async function submitStudentReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const noteId = data.get('notaId')
    if (typeof noteId !== 'string' || !reviewableGrades.some((grade) => grade.id === noteId)) {
      toast('Esta nota não está disponível para uma nova solicitação de reavaliação.')
      return
    }
    const files = data
      .getAll('evidence')
      .filter((item): item is File => item instanceof File && item.size > 0)
    try {
      const attachments = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ nomeArquivo: string; tipoConteudo: string; base64: string }>(
              (resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () =>
                  resolve({
                    nomeArquivo: file.name,
                    tipoConteudo: file.type,
                    base64: String(reader.result),
                  })
                reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}`))
                reader.readAsDataURL(file)
              },
            ),
        ),
      )
      await reviewService.create(noteId, data.get('reason'), attachments)
      setModal(null)
      toast('Solicitação de reavaliação enviada')
      if (sessionUser) setSessionUser({ ...sessionUser })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível enviar o pedido.')
    }
  }

  async function submitReviewDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRequest?.id) return
    const data = new FormData(event.currentTarget)
    const decisao = data.get('decision')
    if (decisao !== 'approve' && decisao !== 'reject') {
      toast('Escolha aprovar ou recusar antes de continuar.')
      return
    }
    const aprovar = decisao === 'approve'
    try {
      await reviewService.respond(
        selectedRequest.id,
        aprovar,
        aprovar ? Number(data.get('newScore')) : undefined,
        aprovar ? undefined : (data.get('rejectReason') ?? undefined),
        data.get('cpf'),
        data.get('confirmPassword'),
      )
      setModal(null)
      toast(
        aprovar
          ? 'Reavaliação aprovada e nota atualizada'
          : 'Reavaliação recusada e motivo registrado',
      )
      if (sessionUser) setSessionUser({ ...sessionUser })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar a decisão.')
    }
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const birthDate = parseBirthDate(data.get('dataNascimento'))
    if (!birthDate) {
      toast('Informe uma data de nascimento válida e não futura, no formato dd/mm/aaaa.')
      return
    }
    const body = Object.fromEntries(data.entries()) as Record<string, unknown>
    body.idade = birthDate.age
    body.dataNascimento = birthDate.iso
    if (modal === 'teacher-create') body.materiaIds = data.getAll('materiaIds').map(Number)
    try {
      if (modal === 'student-create') await studentService.create(body)
      else await teacherService.create(body)
      setModal(null)
      toast(
        modal === 'student-create'
          ? 'Aluno cadastrado com sucesso'
          : 'Professor cadastrado com sucesso',
      )
      if (sessionUser) setSessionUser({ ...sessionUser })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o cadastro.')
    }
  }

  async function submitMatter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    try {
      await subjectService.create(data.get('name'), data.get('code'))
      setModal(null)
      toast('Matéria cadastrada')
      if (sessionUser) setSessionUser({ ...sessionUser })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível cadastrar a matéria.')
    }
  }

  async function submitGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (editingGrade?.id) {
      try {
        await gradeService.update(editingGrade.id, {
          valor: Number(data.get('score')),
          titulo: data.get('title'),
          periodo: data.get('period'),
        })
        setModal(null)
        setEditingGrade(null)
        setSelectedMateriaId(null)
        setSelectedProfessorId(null)
        toast('Nota atualizada com sucesso')
        if (sessionUser) setSessionUser({ ...sessionUser })
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Não foi possível atualizar a nota.')
      }
      return
    }
    const materiaId = Number(data.get('subject'))
    const selectedStudent = students.find((item) => item.id === Number(data.get('student')))
    const professorId = role === 'Administrador' ? Number(data.get('professor')) : undefined
    try {
      await gradeService.create({
        alunoId: selectedStudent?.id,
        materiaId,
        professorId,
        titulo: data.get('title'),
        periodo: data.get('period'),
        valor: Number(data.get('score')),
      })
      setModal(null)
      setSelectedMateriaId(null)
      setSelectedProfessorId(null)
      toast('Nota bimestral salva com sucesso')
      navigate('/alunos')
      if (sessionUser) setSessionUser({ ...sessionUser })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar a nota.')
    }
  }

  const pageTitle = isStudentReportRoute
    ? 'Boletim do aluno'
    : isStudentDetailsRoute
      ? 'Ficha do aluno'
      : isTeacherDetailsRoute
        ? 'Perfil do professor'
        : isGradeCreateRoute
          ? 'Lançar nota bimestral'
          : page
  const pageSubtitle =
    page === 'Visão geral' ||
    page === 'Meu boletim' ||
    isStudentReportRoute ||
    isStudentDetailsRoute ||
    isTeacherDetailsRoute ||
    isGradeCreateRoute
      ? null
      : page === 'Reavaliações'
        ? role === 'Aluno'
          ? 'Acompanhe suas solicitações e as respostas dos professores.'
          : 'Acompanhe os pedidos de revisão enviados pelos alunos.'
        : `Consulte as informações de ${page.toLowerCase()} da escola.`

  return {
    showLogin,
    login: {
      role,
      setRole: (nextRole: Role) => {
        setRole(nextRole)
        setLoginError('')
      },
      loginId,
      loginPassword,
      error: loginError,
      busy: loginBusy,
      onIdChange: (value: string) =>
        updateLoginCredential('id', role === 'Aluno' ? value : formatCpf(value)),
      onPasswordChange: (value: string) => updateLoginCredential('password', value),
      onSubmit: submitLogin,
      onForgotPassword: () => setModal('recovery'),
      recoveryId,
      setRecoveryId,
      requestRecovery,
    },
    layout: {
      page,
      title: pageTitle,
      subtitle: pageSubtitle,
      role,
      pages: visiblePages,
      user: sessionUser,
      pendingReviews,
      accessRequests: recoveryRequests,
      query,
      onQuery: setQuery,
      searchOpen,
      setSearchOpen,
      suggestions: searchSuggestions,
      onSelectSuggestion: openSuggestion,
      notificationsOpen,
      setNotificationsOpen,
      onNavigate: setPage,
      onLogout: logout,
      onNewReview: () => setModal('student-review'),
    },
    routes: {
      role,
      summary,
      averageGrade,
      studentGrades,
      personalSubjects,
      grades,
      filteredGrades,
      requests,
      visibleRequests,
      filteredRequests: filteredReviewRequests,
      reviewFilter: reviewStatusFilter,
      setReviewFilter: setReviewStatusFilter,
      reviewSearch: reviewStudentSearch,
      setReviewSearch: setReviewStudentSearch,
      students,
      filteredStudents,
      subjects,
      recoveryRequests,
      auditLogs: filteredAuditLogs,
      auditFilter,
      setAuditFilter,
      team,
      onNavigate: setPage,
      onEditGrade: (grade: Grade) => {
        setEditingGrade(grade)
        setModal('grade')
      },
      onSelectReview: (request: ReviewRequest) => {
        setSelectedRequest(request)
        setReviewDecision(null)
        setModal('review')
      },
      onCreateStudent: () => setModal('student-create'),
      onCreateGrade: () => {
        setEditingGrade(null)
        setGradeStudentId(null)
        setSelectedMateriaId(null)
        setSelectedProfessorId(null)
        setSelectedPeriod(null)
        navigate('/notas/nova')
      },
      onOpenStudentReport: (student: StudentOption) => navigate(studentReportPath(student.id)),
      onOpenStudentDetails: (student: StudentOption) => navigate(studentDetailsPath(student.id)),
      onCreateSubject: () => setModal('matter-create'),
      onCreateTeacher: () => setModal('teacher-create'),
      onViewTeamMember: (member: TeamOption) => {
        if (member.tipo === 'Professor') navigate(teacherDetailsPath(member.id))
        else {
          setSelectedTeamMember(member)
          setModal('team-details')
        }
      },
      onResolveRecovery: resolveRecovery,
      gradeForm: {
        students,
        subjects,
        role,
        editingGrade: null,
        gradeStudentId,
        setGradeStudentId,
        selectedMateriaId,
        setSelectedMateriaId,
        selectedProfessorId,
        setSelectedProfessorId,
        selectedPeriod,
        setSelectedPeriod,
        availablePeriods,
        onSubmit: submitGrade,
        onCancel: () => {
          setGradeStudentId(null)
          setSelectedMateriaId(null)
          setSelectedProfessorId(null)
          setSelectedPeriod(null)
          navigate('/alunos')
        },
      },
    },
    modals: {
      modal,
      setModal,
      role,
      loginPassword,
      editingGrade,
      selectedTeamMember,
      selectedRequest,
      reviewDecision,
      setReviewDecision,
      students,
      subjects,
      gradeStudentId,
      setGradeStudentId,
      selectedMateriaId,
      setSelectedMateriaId,
      selectedProfessorId,
      setSelectedProfessorId,
      selectedPeriod,
      setSelectedPeriod,
      availablePeriods,
      reviewableGrades,
      temporaryPassword,
      setTemporaryPassword,
      onLogout: logout,
      onToast: toast,
      onSubmitGrade: submitGrade,
      onSubmitReview: submitReviewDecision,
      onSubmitStudentReview: submitStudentReview,
      onSubmitAccount: submitAccount,
      onSubmitMatter: submitMatter,
      onSubmitPassword: submitPasswordChange,
      onCloseGrade: () => {
        setModal(null)
        setEditingGrade(null)
        setGradeStudentId(null)
        setSelectedMateriaId(null)
        setSelectedProfessorId(null)
        setSelectedPeriod(null)
      },
    },
    modal,
    setModal,
    notice,
    toast,
  }
}
