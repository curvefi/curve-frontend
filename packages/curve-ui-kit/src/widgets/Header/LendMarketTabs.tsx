import { useMemo } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentLendMarket, LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { PageTabs } from './PageTabs'
import type { AppPage } from './types'

const getMarketPathname = (pathname: string, marketSegment: string) => {
  if (marketSegment === LEND_MARKET_ROUTES.PAGE_VAULT.split('/')[1]) {
    return pathname.slice(0, pathname.lastIndexOf(LEND_MARKET_ROUTES.PAGE_VAULT))
  }
  return pathname
}

export const LendMarketTabs = ({ pathname }: { pathname: string }) => {
  const pages: AppPage[] = useMemo(() => {
    const marketSegment = getCurrentLendMarket(pathname)
    return [
      {
        label: t`Borrow`,
        href: getMarketPathname(pathname, marketSegment) + LEND_MARKET_ROUTES.PAGE_LOAN,
        isActive: marketSegment === LEND_MARKET_ROUTES.PAGE_LOAN,
      },
      {
        label: t`Supply`,
        href: getMarketPathname(pathname, marketSegment) + LEND_MARKET_ROUTES.PAGE_VAULT,
        isActive: marketSegment === LEND_MARKET_ROUTES.PAGE_VAULT.split('/')[1],
      },
    ]
  }, [pathname])

  return <PageTabs pages={pages} />
}
