import { addCypressRouteDiagnostic } from '@evm-ui/utils'
import { redirect as routerRedirect } from '@tanstack/router-core'

const addCypressRedirectDiagnostic = (to: string) => {
  const message = [
    'route loader redirect',
    `from=${window.location.href}`,
    `to=${to}`,
    `pathname=${window.location.pathname}`,
    `search=${window.location.search}`,
  ].join(' ')

  addCypressRouteDiagnostic(message)
  console.warn(`[cypress route diagnostic] ${message}`)
}

export const redirectTo = <T extends string>(to: T) => {
  addCypressRedirectDiagnostic(to)
  return routerRedirect({ to, throw: true, replace: true })
}
