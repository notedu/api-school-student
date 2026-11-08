import type { ReactNode } from 'react'
import type { Role } from '../types/dominio'
import { Brand } from '../components/ui/Marca'
import { Icon } from '../components/ui/icone'

type Props = {
  role: Role
  setRole: (role: Role) => void
  loginId: string
  loginPassword: string
  error: string
  busy: boolean
  onIdChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onForgotPassword: () => void
  children?: ReactNode
}

export function LoginPage({
  role,
  setRole,
  loginId,
  loginPassword,
  error,
  busy,
  onIdChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  children,
}: Props) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <Brand />
        <p className="eyebrow">BEM-VINDO DE VOLTA</p>
        <h1>
          Seu espaço de
          <br />
          <span>aprendizagem.</span>
        </h1>
        <p className="muted login-copy">
          Entre para acompanhar notas, turmas e tudo o que acontece na escola.
        </p>
        <div className="role-picker">
          {(['Administrador', 'Professor', 'Aluno'] as Role[]).map((item) => (
            <button
              key={item}
              className={role === item ? 'role-active' : ''}
              onClick={() => setRole(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit}>
          <label className="field-label" htmlFor="login-id">
            {role === 'Aluno' ? 'Registro do aluno (RA)' : 'CPF'}
          </label>
          <input
            id="login-id"
            className="field"
            value={loginId}
            onChange={(event) => onIdChange(event.target.value)}
            placeholder={role === 'Aluno' ? 'Ex.: 20241028' : '000.000.000-00'}
            autoComplete="username"
            inputMode="numeric"
            maxLength={role === 'Aluno' ? undefined : 14}
            required
          />
          <label className="field-label" htmlFor="login-password">
            Senha
          </label>
          <input
            id="login-password"
            className="field"
            type="password"
            value={loginPassword}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
          />
          <div className="login-options">
            <span aria-hidden="true" />
            <button type="button" onClick={onForgotPassword}>
              Esqueci a senha
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full" type="submit" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar na plataforma'} <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="login-foot">Acesso seguro · Caderno Escolar</p>
      </section>
      <div className="login-art">
        <div className="art-orb orb-one" />
        <div className="art-orb orb-two" />
        <div className="art-card">
          <div className="art-card-top">
            <span>SEU PROGRESSO</span>
            <span className="live-dot">●</span>
          </div>
          <div className="art-grade">
            8,7 <small>/ 10</small>
          </div>
          <div className="art-line">
            <i />
          </div>
          <p>Muito bom, Mariana! ✨</p>
          <div className="art-subjects">
            <span>
              Matemática <b>8,7</b>
            </span>
            <span>
              Ciências <b>9,2</b>
            </span>
            <span>
              História <b>8,4</b>
            </span>
          </div>
        </div>
        <div className="art-caption">
          <span>✦</span> Aprender também é reconhecer cada conquista.
        </div>
      </div>
      {children}
    </main>
  )
}
