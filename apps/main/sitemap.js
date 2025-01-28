import { MAIN_ROUTE as MAIN_ROUTES } from '@/dex/constants'
import { MAIN_ROUTE as LOAN_ROUTES } from '@/loan/constants'
import { MAIN_ROUTE as LEND_ROUTES } from '@/lend/constants'
import { MAIN_ROUTE as DAO_ROUTES } from '@/dao/constants'
import { getAppRoot } from 'curve-ui-kit/src/shared/routes'

const ROUTES = {
  dao: DAO_ROUTES,
  main: MAIN_ROUTES,
  loan: LOAN_ROUTES,
  lend: LEND_ROUTES,
}

export default function sitemap() {
  return Object.entries(ROUTES).flatMap(([app, routes]) =>
    Object.entries(routes).map(([_, route]) => ({
      url: `${getAppRoot(app)}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  )
}
