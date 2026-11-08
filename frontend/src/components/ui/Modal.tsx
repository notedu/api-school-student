import type { ReactNode } from 'react'
import { Icon } from './icone'

export function Modal({
  title,
  subtitle,
  onClose,
  dismissible = true,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  dismissible?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (dismissible) onClose()
      }}
    >
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {dismissible && (
            <button className="icon-button" onClick={onClose} aria-label="Fechar">
              <Icon name="close" />
            </button>
          )}
        </div>
        {children}
      </section>
    </div>
  )
}
