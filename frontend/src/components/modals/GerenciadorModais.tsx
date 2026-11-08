import type { FormEvent } from 'react'
import type {
  Grade,
  ModalName,
  ReviewRequest,
  Role,
  StudentOption,
  SubjectOption,
  TeamOption,
} from '../../types/dominio'
import { formatCpf } from '../../utils/formatadores'
import { reviewService } from '../../services/servicoReavaliacoes'
import { AddressFields, BirthFields } from '../ui/CamposCadastro'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/icone'
import { GradeForm } from '../forms/FormularioNota'
import { Modal } from '../ui/Modal'

type Props = {
  modal: ModalName
  setModal: (modal: ModalName) => void
  role: Role
  loginPassword: string
  editingGrade: Grade | null
  selectedTeamMember: TeamOption | null
  selectedRequest: ReviewRequest | null
  reviewDecision: 'approve' | 'reject' | null
  setReviewDecision: (decision: 'approve' | 'reject' | null) => void
  students: StudentOption[]
  subjects: SubjectOption[]
  gradeStudentId: number | null
  setGradeStudentId: (id: number | null) => void
  selectedMateriaId: number | null
  setSelectedMateriaId: (id: number | null) => void
  selectedProfessorId: number | null
  setSelectedProfessorId: (id: number | null) => void
  selectedPeriod: string | null
  setSelectedPeriod: (period: string | null) => void
  availablePeriods: string[]
  reviewableGrades: Grade[]
  temporaryPassword: string
  setTemporaryPassword: (value: string) => void
  onLogout: () => void
  onToast: (message: string) => void
  onSubmitGrade: (event: FormEvent<HTMLFormElement>) => void
  onSubmitReview: (event: FormEvent<HTMLFormElement>) => void
  onSubmitStudentReview: (event: FormEvent<HTMLFormElement>) => void
  onSubmitAccount: (event: FormEvent<HTMLFormElement>) => void
  onSubmitMatter: (event: FormEvent<HTMLFormElement>) => void
  onSubmitPassword: (event: FormEvent<HTMLFormElement>) => void
  onCloseGrade: () => void
}

export function ModalHost(props: Props) {
  const {
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
    onLogout,
    onToast,
    onSubmitGrade,
    onSubmitReview,
    onSubmitStudentReview,
    onSubmitAccount,
    onSubmitMatter,
    onSubmitPassword,
    onCloseGrade,
  } = props
  return (
    <>
      {modal === 'grade' && (
        <Modal
          title={editingGrade ? 'Editar nota bimestral' : 'Lançar nota bimestral'}
          subtitle="A nota representa a síntese do bimestre. Um novo lançamento para o mesmo aluno, matéria e bimestre atualiza a nota existente."
          onClose={onCloseGrade}
        >
          <GradeForm
            students={students}
            subjects={subjects}
            role={role}
            editingGrade={editingGrade}
            gradeStudentId={gradeStudentId}
            setGradeStudentId={setGradeStudentId}
            selectedMateriaId={selectedMateriaId}
            setSelectedMateriaId={setSelectedMateriaId}
            selectedProfessorId={selectedProfessorId}
            setSelectedProfessorId={setSelectedProfessorId}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            availablePeriods={availablePeriods}
            onSubmit={onSubmitGrade}
            onCancel={onCloseGrade}
          />
        </Modal>
      )}
      {modal === 'team-details' && selectedTeamMember && (
        <Modal
          title={selectedTeamMember.nome}
          subtitle={selectedTeamMember.tipo}
          onClose={() => setModal(null)}
        >
          <div className="team-detail">
            <span>CPF</span>
            <b>{formatCpf(selectedTeamMember.cpf)}</b>
          </div>
        </Modal>
      )}
      {modal === 'student-review' && (
        <Modal
          title="Pedir reavaliação"
          subtitle="O pedido será vinculado à nota e enviado ao professor responsável."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={onSubmitStudentReview}>
            <div className="field-block full-span">
              <label className="field-label">Nota para revisão</label>
              <select
                className="field"
                name="notaId"
                required
                disabled={reviewableGrades.length === 0}
                defaultValue=""
              >
                <option value="" disabled>
                  {reviewableGrades.length
                    ? 'Selecione uma nota abaixo de 6,0'
                    : 'Não há notas disponíveis para solicitar reavaliação'}
                </option>
                {reviewableGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.subject} · {grade.title} · {grade.score.toFixed(1)}
                  </option>
                ))}
              </select>
              <small className="address-status">
                Uma nota com pedido pendente ou reavaliação recusada não pode receber outro pedido.
              </small>
            </div>
            <div className="field-block full-span">
              <label className="field-label">Explique por que solicita a revisão</label>
              <textarea
                className="field text-area"
                name="reason"
                minLength={10}
                required
                placeholder="Descreva as questões e o motivo da solicitação…"
              />
            </div>
            <div className="field-block full-span">
              <label className="field-label">Comprovantes (PDF ou imagens, até 5 arquivos)</label>
              <input
                className="field file-field"
                name="evidence"
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
              />
            </div>
            <div className="modal-actions full-span">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary" disabled={reviewableGrades.length === 0}>
                Enviar solicitação <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'review' && selectedRequest && (
        <Modal
          title="Detalhes da reavaliação"
          subtitle={`${selectedRequest.subject} · ${selectedRequest.grade}`}
          onClose={() => {
            setModal(null)
            setReviewDecision(null)
          }}
        >
          <form className="review-detail" onSubmit={onSubmitReview}>
            <div className="review-student">
              <Avatar initials={selectedRequest.initials} color={selectedRequest.color} />
              <span>
                <b>{selectedRequest.student}</b>
                <small>Solicitou em {selectedRequest.time}</small>
              </span>
            </div>
            <div className="current-score">
              <small>NOTA NA SOLICITAÇÃO</small>
              <strong>
                {selectedRequest.score.toFixed(1)}
                <em> / 10</em>
              </strong>
            </div>
            <div>
              <label className="field-label">Motivo informado pelo aluno</label>
              <p className="reason-box">{selectedRequest.reason}</p>
            </div>
            <div className="attachments">
              <b className="field-label full-span">Comprovantes anexados</b>
              {selectedRequest.attachments?.length ? (
                selectedRequest.attachments.map((file) => (
                  <button
                    type="button"
                    key={file.id}
                    onClick={() =>
                      void reviewService
                        .downloadEvidence(file.id, file.nomeArquivo)
                        .catch((error: Error) => onToast(error.message))
                    }
                  >
                    <Icon name="upload" size={16} /> {file.nomeArquivo}{' '}
                    <small>{(file.tamanhoBytes / 1024).toFixed(0)} KB</small>
                  </button>
                ))
              ) : (
                <span>
                  <Icon name="upload" size={16} /> Sem anexos
                </span>
              )}
            </div>
            {selectedRequest.state !== 'Aguardando análise' && (
              <div className="teacher-response">
                <div className="response-head">
                  <b>Resposta do professor</b>
                  <span
                    className={`status ${selectedRequest.state === 'Aprovada' ? 'status-done' : 'status-rejected'}`}
                  >
                    <i />
                    {selectedRequest.state}
                  </span>
                </div>
                <p className="response-teacher">
                  Respondida por {selectedRequest.teacherName ?? 'professor responsável'}
                  {selectedRequest.respondedAt
                    ? ` · ${new Date(selectedRequest.respondedAt).toLocaleString('pt-BR')}`
                    : ''}
                </p>
                {selectedRequest.state === 'Aprovada' ? (
                  <div className="score-change">
                    <span>
                      Nota anterior <strong>{selectedRequest.score.toFixed(1)}</strong>
                    </span>
                    <b aria-hidden="true">→</b>
                    <span>
                      Nota atribuída{' '}
                      <strong>
                        {(selectedRequest.assignedScore ?? selectedRequest.score).toFixed(1)}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <>
                    <label className="field-label">Motivo da recusa</label>
                    <p className="reason-box">
                      {selectedRequest.teacherReason || 'Nenhum motivo foi registrado.'}
                    </p>
                  </>
                )}
              </div>
            )}
            {role === 'Professor' && selectedRequest.state === 'Aguardando análise' && (
              <>
                <label className="field-label">Sua decisão</label>
                <div className="decision-options">
                  <label>
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={reviewDecision === 'approve'}
                      onChange={() => setReviewDecision('approve')}
                    />{' '}
                    Aprovar e atribuir nova nota
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={reviewDecision === 'reject'}
                      onChange={() => setReviewDecision('reject')}
                    />{' '}
                    Recusar pedido
                  </label>
                </div>
                {reviewDecision === 'approve' && (
                  <>
                    <label className="field-label">Nota a atribuir (0 a 10)</label>
                    <input
                      name="newScore"
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      className="field"
                      defaultValue={Math.round(selectedRequest.score)}
                      required
                    />
                  </>
                )}
                {reviewDecision === 'reject' && (
                  <>
                    <label className="field-label">Motivo da recusa</label>
                    <textarea
                      name="rejectReason"
                      className="field text-area"
                      minLength={5}
                      required
                      placeholder="Explique por que o pedido foi recusado"
                    />
                  </>
                )}
                {reviewDecision && (
                  <>
                    <label className="field-label">Confirme seu CPF</label>
                    <input name="cpf" className="field" required placeholder="000.000.000-00" />
                    <label className="field-label">Confirme sua senha</label>
                    <input name="confirmPassword" type="password" className="field" required />
                    <p className="security-note">
                      A decisão e a confirmação de identidade serão registradas no log
                      administrativo.
                    </p>
                  </>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setModal(null)
                      setReviewDecision(null)
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="primary" disabled={!reviewDecision}>
                    Confirmar decisão
                  </button>
                </div>
              </>
            )}
          </form>
        </Modal>
      )}
      {modal === 'student-create' && (
        <Modal
          title="Cadastrar aluno"
          subtitle="Os dados pessoais e o endereço serão usados no acesso e no cadastro escolar."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={onSubmitAccount}>
            <div className="field-block full-span">
              <label className="field-label">Nome completo</label>
              <input className="field" name="nome" required />
            </div>
            <BirthFields />
            <div className="field-block">
              <label className="field-label">CPF</label>
              <input className="field" name="cpf" required placeholder="000.000.000-00" />
            </div>
            <div className="field-block">
              <label className="field-label">RA</label>
              <input className="field" name="ra" required />
            </div>
            <div className="field-block full-span">
              <label className="field-label">Responsável legal</label>
              <input className="field" name="responsavelLegal" required />
            </div>
            <div className="field-block full-span">
              <label className="field-label">Senha inicial</label>
              <input className="field" name="password" type="password" minLength={8} required />
            </div>
            <AddressFields />
            <div className="modal-actions full-span">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary">
                Cadastrar aluno
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'teacher-create' && (
        <Modal
          title="Cadastrar professor"
          subtitle="Associe uma ou mais matérias para delimitar o acesso às notas."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={onSubmitAccount}>
            <div className="field-block full-span">
              <label className="field-label">Nome completo</label>
              <input className="field" name="nome" required />
            </div>
            <BirthFields />
            <div className="field-block">
              <label className="field-label">CPF</label>
              <input className="field" name="cpf" required placeholder="000.000.000-00" />
            </div>
            <div className="field-block">
              <label className="field-label">Senha inicial</label>
              <input className="field" name="password" type="password" minLength={8} required />
            </div>
            <AddressFields />
            <div className="field-block full-span">
              <label className="field-label">Matérias atribuídas</label>
              <div className="check-grid">
                {subjects.map((subject) => (
                  <label key={subject.id}>
                    <input type="checkbox" name="materiaIds" value={subject.id} /> {subject.nome}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions full-span">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary">
                Cadastrar professor
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'matter-create' && (
        <Modal
          title="Cadastrar matéria"
          subtitle="Crie a matéria e depois vincule um ou mais professores."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={onSubmitMatter}>
            <div className="field-block full-span">
              <label className="field-label">Nome da matéria</label>
              <input className="field" name="name" required placeholder="Ex.: Matemática" />
            </div>
            <div className="field-block full-span">
              <label className="field-label">Código</label>
              <input className="field" name="code" required placeholder="Ex.: MAT" />
            </div>
            <div className="modal-actions full-span">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className="primary">
                Salvar matéria
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'change-password' && (
        <Modal
          title="Crie sua senha definitiva"
          subtitle="Por segurança, a senha temporária só pode ser usada para esta troca."
          onClose={onLogout}
          dismissible={false}
        >
          <form className="form-grid" onSubmit={onSubmitPassword}>
            <div className="field-block full-span">
              <label className="field-label">Senha temporária</label>
              <input
                className="field"
                name="currentPassword"
                type="password"
                defaultValue={loginPassword}
                required
              />
            </div>
            <div className="field-block full-span">
              <label className="field-label">Nova senha</label>
              <input
                className="field"
                name="newPassword"
                type="password"
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}"
                title="Use 8 caracteres ou mais, com maiúscula, minúscula, número e símbolo."
                required
              />
              <small className="address-status">
                Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.
              </small>
            </div>
            <div className="field-block full-span">
              <label className="field-label">Confirme a nova senha</label>
              <input
                className="field"
                name="confirmPassword"
                type="password"
                minLength={8}
                required
              />
            </div>
            <div className="modal-actions full-span">
              <button type="submit" className="primary">
                Salvar nova senha
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'temporary-password' && (
        <Modal
          title="Senha temporária gerada"
          subtitle="Entregue a senha ao usuário por um canal seguro. Ela expira em 30 minutos."
          onClose={() => {
            setModal(null)
            setTemporaryPassword('')
          }}
        >
          <label className="field-label">Senha de uso único</label>
          <input
            className="field temp-password"
            value={temporaryPassword}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <p className="security-note">
            Esta senha será exibida somente agora. O usuário deverá criar uma senha definitiva no
            próximo acesso.
          </p>
          <div className="modal-actions">
            <button
              className="primary"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(temporaryPassword)
                  .then(() => onToast('Senha copiada'))
                setModal(null)
                setTemporaryPassword('')
              }}
            >
              Copiar e fechar
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
