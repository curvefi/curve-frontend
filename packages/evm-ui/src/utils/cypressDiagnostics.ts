import { IS_CYPRESS } from './env'

const CYPRESS_ROUTE_DIAGNOSTICS_KEY = 'CurveCypressRouteDiagnostics'

const getStoredDiagnostics = () => {
  try {
    const diagnostics: unknown = JSON.parse(window.localStorage?.getItem(CYPRESS_ROUTE_DIAGNOSTICS_KEY) ?? '[]')
    return Array.isArray(diagnostics) && diagnostics.every(item => typeof item === 'string') ? diagnostics : []
  } catch {
    return []
  }
}

export const addCypressRouteDiagnostic = (message: string) => {
  if (!IS_CYPRESS) return

  const entry = `[${new Date().toISOString()}] ${message}`
  const diagnostics = [...getStoredDiagnostics(), ...(window.CurveCypressDiagnostics ?? []), entry]

  window.CurveCypressDiagnostics = diagnostics
  window.localStorage?.setItem(CYPRESS_ROUTE_DIAGNOSTICS_KEY, JSON.stringify(diagnostics))
}
