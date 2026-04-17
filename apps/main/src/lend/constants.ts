import { LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'

export const ROUTE = {
  ...LEND_ROUTES,
  PAGE_INTEGRATIONS: '/integrations',
  ...LEND_MARKET_ROUTES,
  PAGE_404: '/404',
} as const

// TODO: translation
export const NOFITY_MESSAGE = {
  pendingConfirm: 'Pending wallet confirmation.',
}
