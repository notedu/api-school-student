import { Icon } from './icone'

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Icon name="subjects" size={21} />
      </span>
      <span>
        caderno<span className="brand-dot">.</span>
        <small>GESTÃO ESCOLAR</small>
      </span>
    </div>
  )
}
