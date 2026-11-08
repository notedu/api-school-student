import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/icone'
import { studentService, type StudentDetails } from '../services/servicoAlunos'
import { formatCpf } from '../utils/formatadores'

export function StudentDetailsPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<{
    key: string
    student: StudentDetails | null
    error: string
  } | null>(null)

  useEffect(() => {
    let active = true
    const key = studentId ?? ''
    if (!studentId || !Number.isSafeInteger(Number(studentId))) {
      void Promise.resolve().then(() => {
        if (active) setResult({ key, student: null, error: 'Identificador de aluno inválido.' })
      })
      return () => {
        active = false
      }
    }
    void studentService
      .detail(Number(studentId))
      .then((result) => {
        if (active) setResult({ key, student: result, error: '' })
      })
      .catch((requestError: Error) => {
        if (active) setResult({ key, student: null, error: requestError.message })
      })
    return () => {
      active = false
    }
  }, [studentId])

  const loading = !result || result.key !== (studentId ?? '')
  if (loading)
    return (
      <section className="panel profile-panel">
        <p className="muted">Carregando ficha do aluno…</p>
      </section>
    )
  const student = result.student
  if (result.error || !student)
    return (
      <section className="panel profile-panel">
        <div className="detail-error">
          <p>{result.error || 'Aluno não encontrado.'}</p>
          <button className="secondary" onClick={() => navigate('/alunos')}>
            Voltar para alunos
          </button>
        </div>
      </section>
    )

  const initials = student.nome
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
  const reviews = student.notas.flatMap((note) =>
    note.reavaliacoes.map((review) => ({
      ...review,
      subject: note.materia.nome,
      period: note.periodo,
    })),
  )
  const address = `${student.rua}, ${student.numeroCasa}${student.complemento ? `, ${student.complemento}` : ''}, ${student.bairro}, ${student.cidade} - ${student.estado}`

  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <button className="back-link" onClick={() => navigate('/alunos')}>
          <Icon name="arrow" size={15} /> Voltar para alunos
        </button>
        <button className="secondary" onClick={() => navigate(`/alunos/${student.id}/boletim`)}>
          Ver boletim
        </button>
      </div>
      <section className="panel profile-panel">
        <div className="profile-heading">
          <Avatar initials={initials} color="lilac" />
          <div>
            <p className="eyebrow">FICHA DO ALUNO</p>
            <h2>{student.nome}</h2>
            <p className="muted">RA {student.ra}</p>
          </div>
        </div>
        <div className="profile-stat-grid">
          <article>
            <small>Notas lançadas</small>
            <strong>{student.notas.length}</strong>
          </article>
          <article>
            <small>Matérias</small>
            <strong>{new Set(student.notas.map((note) => note.materia.id)).size}</strong>
          </article>
          <article>
            <small>Reavaliações</small>
            <strong>{reviews.length}</strong>
          </article>
        </div>
      </section>
      <div className="details-grid">
        <section className="panel detail-card">
          <div className="panel-heading">
            <div>
              <h2>Dados pessoais</h2>
              <p>Informações cadastradas do aluno</p>
            </div>
          </div>
          <dl className="detail-fields">
            <div>
              <dt>Nome completo</dt>
              <dd>{student.nome}</dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>{formatCpf(student.cpf)}</dd>
            </div>
            <div>
              <dt>RA</dt>
              <dd>{student.ra}</dd>
            </div>
            <div>
              <dt>Idade</dt>
              <dd>{student.idade} anos</dd>
            </div>
            <div>
              <dt>Data de nascimento</dt>
              <dd>{formatDate(student.dataNascimento)}</dd>
            </div>
            <div className="detail-field-wide">
              <dt>Responsável legal</dt>
              <dd>{student.responsavelLegal}</dd>
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
              <dd>{student.cep || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Cidade e estado</dt>
              <dd>
                {student.cidade} - {student.estado}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="panel detail-card detail-table-card">
        <div className="panel-heading">
          <div>
            <h2>Notas bimestrais</h2>
            <p>Notas e professores responsáveis</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MATÉRIA</th>
                <th>AVALIAÇÃO</th>
                <th>PERÍODO</th>
                <th>PROFESSOR</th>
                <th>NOTA</th>
              </tr>
            </thead>
            <tbody>
              {student.notas.map((note) => (
                <tr key={note.id}>
                  <td>
                    <b>{note.materia.nome}</b>
                  </td>
                  <td>{note.titulo}</td>
                  <td>{note.periodo}</td>
                  <td>{note.professor.nome}</td>
                  <td>
                    <span
                      className={`grade-pill ${Number(note.valor) < 6 ? 'grade-low' : 'grade-high'}`}
                    >
                      {Number(note.valor).toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {student.notas.length === 0 && (
            <div className="empty-state">Ainda não há notas cadastradas para este aluno.</div>
          )}
        </div>
      </section>
      {reviews.length > 0 && (
        <section className="panel detail-card">
          <div className="panel-heading">
            <div>
              <h2>Reavaliações</h2>
              <p>Histórico de solicitações relacionadas às notas</p>
            </div>
          </div>
          <div className="detail-review-list">
            {reviews.map((review) => (
              <article className="detail-review-row" key={review.id}>
                <div>
                  <b>
                    {review.subject} · {review.period}
                  </b>
                  <small>
                    {review.status === 'PENDENTE'
                      ? 'Aguardando análise'
                      : review.status === 'APROVADA'
                        ? `Aprovada · nota ${review.valorAnterior} → ${review.valorAtribuido}`
                        : 'Recusada'}
                  </small>
                  {review.motivoRecusa && <p>{review.motivoRecusa}</p>}
                </div>
                <time>{formatDateTime(review.criadoEm)}</time>
              </article>
            ))}
          </div>
        </section>
      )}
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
