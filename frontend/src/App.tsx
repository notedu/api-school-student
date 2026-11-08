import { Modal } from './components/ui/Modal'
import { ModalHost } from './components/modals/GerenciadorModais'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/PaginaLogin'
import { AppRoutes } from './routes/RotasAplicacao'
import { Icon } from './components/ui/icone'
import { useSchoolController } from './hooks/useControladorEscola'

function App() {
  const app = useSchoolController()
  if (app.showLogin)
    return (
      <LoginPage {...app.login}>
        {app.modal === 'recovery' && (
          <Modal title="Recuperar acesso" onClose={() => app.setModal(null)}>
            <p className="muted">
              Informe seu RA ou CPF. Sua solicitação será encaminhada à equipe administrativa.
            </p>
            <label className="field-label" htmlFor="recovery-id">
              {app.login.role === 'Aluno' ? 'RA do aluno' : 'CPF'}
            </label>
            <input
              id="recovery-id"
              className="field"
              value={app.login.recoveryId}
              onChange={(event) => app.login.setRecoveryId(event.target.value)}
              placeholder="Digite sua identificação"
            />
            <button className="primary full" onClick={() => void app.login.requestRecovery()}>
              Solicitar nova senha
            </button>
          </Modal>
        )}
      </LoginPage>
    )
  return (
    <>
      <AppLayout {...app.layout}>
        <AppRoutes {...app.routes} />
      </AppLayout>
      <ModalHost {...app.modals} />
      {app.notice && (
        <div className="toast">
          <span>
            <Icon name="check" size={16} />
          </span>
          {app.notice}
        </div>
      )}
    </>
  )
}

export default App
