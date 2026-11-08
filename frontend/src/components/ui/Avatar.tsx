export function Avatar({
  initials,
  color = 'mint',
  small = false,
}: {
  initials: string
  color?: string
  small?: boolean
}) {
  return <span className={`avatar avatar-${color} ${small ? 'avatar-sm' : ''}`}>{initials}</span>
}
