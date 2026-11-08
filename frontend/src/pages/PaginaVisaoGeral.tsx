import type {
  DashboardStats,
  Grade,
  Page,
  Role,
  ReviewRequest,
  SubjectOption,
} from '../types/dominio'
import { Avatar } from '../components/ui/Avatar'
import { GradesTable } from '../components/ui/TabelasNotas'
import { Icon } from '../components/ui/icone'
import { StatCard, SubjectRow } from '../components/ui/CartoesVisaoGeral'

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
  onNavigate: (page: Page) => void
  onEditGrade: (grade: Grade) => void
  onSelectRequest: (request: ReviewRequest) => void
}

export function DashboardPage({
  role,
  summary,
  averageGrade,
  studentGrades,
  personalSubjects,
  grades,
  filteredGrades,
  requests,
  visibleRequests,
  onNavigate,
  onEditGrade,
  onSelectRequest,
}: Props) {
  return (
    <>
      <section className={`stats-grid ${role === 'Aluno' ? 'student-stats' : ''}`}>
        {role !== 'Aluno' && (
          <StatCard
            label="Alunos ativos"
            value={summary ? summary.alunos.toLocaleString('pt-BR') : '—'}
            delta="Total cadastrado"
            note="na escola"
            icon="students"
            tint="mint"
            chart={[28, 40, 34, 54, 47, 67, 60, 82]}
          />
        )}
        <StatCard
          label={role === 'Aluno' ? 'Sua média' : 'Média das notas'}
          value={averageGrade}
          delta={
            role === 'Aluno'
              ? `${studentGrades.length} notas suas`
              : `${summary?.notas ?? 0} avaliações`
          }
          note={role === 'Aluno' ? 'nas suas matérias' : 'no seu escopo de acesso'}
          icon="grades"
          tint="lilac"
          chart={[45, 36, 55, 49, 64, 56, 76, 68]}
        />
        <StatCard
          label={role === 'Aluno' ? 'Suas matérias' : 'Matérias'}
          value={
            role === 'Aluno'
              ? String(personalSubjects.length)
              : summary
                ? String(summary.materias)
                : '—'
          }
          delta={role === 'Aluno' ? 'Com notas lançadas' : 'Ativas'}
          note={role === 'Aluno' ? 'no seu boletim' : 'no seu escopo de acesso'}
          icon="subjects"
          tint="peach"
          chart={[30, 36, 36, 50, 50, 62, 74, 74]}
        />
        <StatCard
          label={role === 'Aluno' ? 'Suas reavaliações' : 'Reavaliações'}
          value={
            role === 'Aluno'
              ? String(
                  visibleRequests.filter((request) => request.state === 'Aguardando análise')
                    .length,
                )
              : String(summary?.reavaliacoesPendentes ?? 0)
          }
          delta={
            role === 'Aluno'
              ? visibleRequests.some((request) => request.state === 'Aguardando análise')
                ? 'Aguardando'
                : 'Em dia'
              : summary?.reavaliacoesPendentes
                ? 'Atenção'
                : 'Em dia'
          }
          note={role === 'Aluno' ? 'aguardando resposta' : 'aguardando análise'}
          icon="review"
          tint="yellow"
          chart={[30, 45, 35, 65, 45, 72, 56, 82]}
        />
      </section>
      <section className="dashboard-grid">
        <div className="panel subject-panel">
          <div className="panel-heading">
            <div>
              <h2>{role === 'Aluno' ? 'Suas matérias' : 'Por matéria'}</h2>
              <p>
                {role === 'Aluno'
                  ? 'Média das suas notas em cada matéria'
                  : 'Média das notas no seu escopo'}
              </p>
            </div>
            <button
              className="more-button"
              onClick={() => onNavigate(role === 'Aluno' ? 'Meu boletim' : 'Matérias')}
            >
              •••
            </button>
          </div>
          <div className="subject-list">
            {personalSubjects.slice(0, 4).map((subject, index) => {
              const values = grades.filter((grade) => grade.materiaId === subject.id)
              const average = values.length
                ? values.reduce((sum, grade) => sum + grade.score, 0) / values.length
                : 0
              return (
                <SubjectRow
                  key={subject.id}
                  name={subject.nome}
                  teacher={
                    subject.professores.map(({ professor }) => professor.nome).join(', ') ||
                    'Sem professor'
                  }
                  score={average.toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  percent={average * 10}
                  tone={['violet', 'green', 'gold', 'pink'][index]}
                  initials={subject.nome.slice(0, 2).toUpperCase()}
                />
              )
            })}
            {personalSubjects.length === 0 && (
              <div className="empty-state">
                {role === 'Aluno'
                  ? 'Você ainda não tem notas por matéria.'
                  : 'Nenhuma matéria para exibir.'}
              </div>
            )}
          </div>
          <button
            className="text-link"
            onClick={() => onNavigate(role === 'Aluno' ? 'Meu boletim' : 'Matérias')}
          >
            {role === 'Aluno' ? 'Ver boletim' : 'Ver todas as matérias'}{' '}
            <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
      {role !== 'Aluno' && (
        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Notas recentes</h2>
              <p>Últimas notas bimestrais registradas</p>
            </div>
            <button className="text-link" onClick={() => onNavigate('Alunos')}>
              Ver alunos <Icon name="arrow" size={15} />
            </button>
          </div>
          <GradesTable rows={filteredGrades.slice(0, 4)} canEdit onEdit={onEditGrade} />
        </section>
      )}
      <section className="bottom-grid">
        <div className="panel request-panel">
          <div className="panel-heading">
            <div>
              <h2>{role === 'Aluno' ? 'Suas reavaliações' : 'Reavaliações recentes'}</h2>
              <p>
                {role === 'Aluno'
                  ? 'Acompanhe seus pedidos e as respostas dos professores.'
                  : 'Solicitações que precisam da sua atenção'}
              </p>
            </div>
            <button className="text-link" onClick={() => onNavigate('Reavaliações')}>
              {role === 'Aluno' ? 'Ver minhas solicitações' : 'Ver todas'}{' '}
              <Icon name="arrow" size={15} />
            </button>
          </div>
          {(role === 'Aluno' ? visibleRequests : requests).slice(0, 2).map((item) => (
            <button
              className="request-row"
              key={item.id ?? item.student}
              onClick={() => onSelectRequest(item)}
            >
              <Avatar initials={item.initials} color={item.color} small />
              <span className="request-info">
                <b>{item.student}</b>
                <small>
                  {item.subject} <i>·</i> nota {item.score.toFixed(1)}
                </small>
              </span>
              <span
                className={`status ${item.state === 'Aguardando análise' ? '' : item.state === 'Recusada' ? 'status-rejected' : 'status-done'}`}
              >
                <i />
                {item.state}
              </span>
              <Icon name="arrow" size={16} className="row-arrow" />
            </button>
          ))}
          {(role === 'Aluno' ? visibleRequests : requests).length === 0 && (
            <div className="empty-state">
              {role === 'Aluno'
                ? 'Você ainda não tem solicitações de reavaliação.'
                : 'Nenhuma reavaliação recente.'}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
