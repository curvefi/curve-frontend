export * from './styles'
export { default as AppNavMobile } from './AppNavMobile'
export { default as AppNavSecondary } from './AppNavSecondary'

const isDevelopment = process.env.NODE_ENV === 'development'

export const APPS_LINKS = [
  { id: 'dao', href: 'https://dao.curve.fi/', label: 'DAO' },
  { id: 'governance', href: 'https://gov.curve.fi/', label: 'Governance' },
  { id: 'main', href: isDevelopment ? 'http://localhost:3000' : 'https://curve.fi/', label: 'Curve.fi' },
  { id: 'loan', href: isDevelopment ? 'http://localhost:3001' : 'https://crvusd.curve.fi/', label: 'crvUSD' },
  { id: 'lend', href: isDevelopment ? 'http://localhost:3003' : 'https://lend.curve.fi/', label: 'Llama Lend' },
]
