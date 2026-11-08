import { Icon } from './icone'

export function StatCard({
  label,
  value,
  delta,
  note,
  icon,
  tint,
  chart,
}: {
  label: string
  value: string
  delta: string
  note: string
  icon: string
  tint: string
  chart: number[]
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <i className={`stat-icon ${tint}`}>
          <Icon name={icon} size={18} />
        </i>
      </div>
      <div className="stat-value-row">
        <strong>{value}</strong>
        <div className="mini-chart">
          {chart.map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
      <div className="stat-foot">
        <b className={tint === 'yellow' ? 'attention' : ''}>
          {tint !== 'yellow' && '↗ '}
          {delta}
        </b>
        <span>{note}</span>
      </div>
    </article>
  )
}

export function SubjectRow({
  name,
  teacher,
  score,
  percent,
  tone,
  initials,
}: {
  name: string
  teacher: string
  score: string
  percent: number
  tone: string
  initials: string
}) {
  return (
    <div className="subject-row">
      <span className={`subject-avatar ${tone}`}>{initials}</span>
      <span className="subject-meta">
        <b>{name}</b>
        <small>{teacher}</small>
      </span>
      <div className="subject-progress">
        <div>
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>
      <strong>{score}</strong>
    </div>
  )
}
