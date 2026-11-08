import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'
import { teacherService, type TeacherDetails } from '../services/servicoProfessores'
import { formatCpf } from '../utils/formatadores'

export function TeacherDetailsPage() {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<{
    key: string
    teacher: TeacherDetails | null
    error: string
  } | null>(null)

  useEffect(() => {
    let active = true
    const key = teacherId ?? ''
    if (!teacherId || !Number.isSafeInteger(Number(teacherId))) {
      void Promise.resolve().then(() => {
        if (active) setResult({ key, teacher: null, error: 'Identificador de professor inválido.' })
      })
      return () => {
        active = false
      }
    }
    void teacherService
      .detail(Number(teacherId))
      .then((result) => {
        if (active) setResult({ key, teacher: result, error: '' })
      })
      .catch((requestError: Error) => {
        if (active) setResult({ key, teacher: null, error: requestError.message })
      })
    return () => {
      active = false
    }
  }, [teacherId])

  const loading = !result || result.key !== (teacherId ?? '')
  if (loading)
    return (
      <section className="panel profile-panel">
        <p className="muted">Carregando perfil do professor…</p>
      </section>
    )
  const teacher = result.teacher
  if (result.error || !teacher)
    return (
      <section className="panel profile-panel">
        <div className="detail-error">
          <p>{result.error || 'Professor não encontrado.'}</p>
          <button className="secondary" onClick={() => navigate('/professores')}>
            Voltar para professores
          </button>
        </div>
      </section>
    )

  const initials = teacher.nome
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
  const address = `${teacher.rua}, ${teacher.numeroCasa}${teacher.complemento ? `, ${teacher.complemento}` : ''}, ${teacher.bairro}, ${teacher.cidade} - ${teacher.estado}`

  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <button className="back-link" onClick={() => navigate('/professores')}>
          <Icon name="arrow" size={15} /> Voltar para professores
        </button>
      </div>
      <section className="panel profile-panel">
        <div className="profile-heading">
          <Avatar initials={initials} color="lilac" />
          <div>
            <p className="eyebrow">PERFIL DO PROFESSOR</p>
            <h2>{teacher.nome}</h2>
            <p className="muted">
              {teacher.materias.length}{' '}
              {teacher.materias.length === 1 ? 'matéria atribuída' : 'matérias atribuídas'}
            </p>
          </div>
        </div>
        <div className="profile-stat-grid">
          <article>
            <small>Matérias atribuídas</small>
            <strong>{teacher.materias.length}</strong>
          </article>
          <article>
            <small>Reavaliações recebidas</small>
            <strong>{teacher.reavaliacoes.length}</strong>
          </article>
          <article>
            <small>Pendentes</small>
            <strong>
              {teacher.reavaliacoes.filter((review) => review.status === 'PENDENTE').length}
            </strong>
          </article>
        </div>
      </section>
      <div className="details-grid">
        <section className="panel detail-card">
          <div className="panel-heading">
            <div>
              <h2>Dados pessoais</h2>
              <p>Informações cadastradas do professor</p>
            </div>
          </div>
          <dl className="detail-fields">
            <div>
              <dt>Nome completo</dt>
              <dd>{teacher.nome}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{formatCpf(teacher.cpf)}</dd>
            </div>
            <div>
              <dt>Idade</dt>
              <dd>{teacher.idade} anos</dd>
            </div>
            <div>
              <dt>Data de nascimento</dt>
              <dd>{formatDate(teacher.dataNascimento)}</dd>
            </div>
          </dl>
        </section>
        <section className="panel detail-card">
          <div className="panel-heading">
            <div>
              <h2>Endereço</h2>
              <p>Endereço informado no cadastro</p>
            </div>
          </div>
          <dl className="detail-fields">
            <div className="detail-field-wide">
              <dt>Logradouro</dt>
              <dd>{address}</dd>
            </div>
            <div>
              <dt>CEP</dt>
              <dd>{teacher.cep || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Cidade e estado</dt>
              <dd>
                {teacher.cidade} - {teacher.estado}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="panel detail-card">
        <div className="panel-heading">
          <div>
            <h2>Matérias atribuídas</h2>
            <p>Disciplinas sob responsabilidade deste professor</p>
          </div>
        </div>
        {teacher.materias.length ? (
          <div className="detail-subject-grid">
            {teacher.materias.map(({ materia }) => (
              <article className="detail-subject" key={materia.id}>
                <span className="subject-icon mint">
                  {materia.codigo.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <b>{materia.nome}</b>
                  <small>
                    {materia.codigo} · {materia.ativa ? 'Ativa' : 'Inativa'}
                  </small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">Nenhuma matéria atribuída.</div>
        )}
      </section>
      <section className="panel detail-card">
        <div className="panel-heading">
          <div>
            <h2>Reavaliações</h2>
            <p>Solicitações vinculadas às matérias deste professor</p>
          </div>
        </div>
        {teacher.reavaliacoes.length ? (
          <div className="detail-review-list">
            {teacher.reavaliacoes.map((review) => (
              <article className="detail-review-row" key={review.id}>
                <div>
                  <b>
                    {review.aluno.nome} <span>· RA {review.aluno.ra}</span>
                  </b>
                  <small>
                    {review.nota.materia.nome} · {review.nota.titulo} · {review.nota.periodo}
                  </small>
                  <small>
                    {review.status === 'PENDENTE'
                      ? 'Aguardando análise'
                      : review.status === 'APROVADA'
                        ? `Aprovada · nota ${review.valorAnterior} → ${review.valorAtribuido}`
                        : 'Recusada'}
                  </small>
                  {review.motivoRecusa && <p>Motivo da recusa: {review.motivoRecusa}</p>}
                  <p>Solicitação: {review.motivo}</p>
                </div>
                <time>{formatDateTime(review.criadoEm)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Este professor ainda não recebeu solicitações de reavaliação.
          </div>
        )}
      </section>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? 'Não informado'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}
