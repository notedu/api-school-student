import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../types/dominio'

export function RequireRole({
  role,
  allowed,
  children,
}: {
  role: Role
  allowed: Role[]
  children: ReactNode
}) {
  return allowed.includes(role) ? children : <Navigate to="/dashboard" replace />
}
