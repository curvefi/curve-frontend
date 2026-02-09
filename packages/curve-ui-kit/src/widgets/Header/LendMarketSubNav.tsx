import { useMemo } from 'react'
import { usePathname } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentLendMarket, LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { PageTabsSwitcher } from './PageTabsSwitcher'
import { SubNav } from './SubNav'
import type { AppPage } from './types'

const getMarketPathname = (pathname: string, marketSegment: string) => {
  if (marketSegment === LEND_MARKET_ROUTES.PAGE_VAULT.split('/')[1]) {
    return pathname.slice(0, pathname.lastIndexOf(LEND_MARKET_ROUTES.PAGE_VAULT))
  }
  return pathname
}

export const LendMarketSubNav = () => {
  const pathname = usePathname()

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

  return (
    <SubNav testId="lend-subnav">
      <PageTabsSwitcher pages={pages} overflow={useIsMobile() ? 'fullWidth' : 'standard'} />
    </SubNav>
  )
}
