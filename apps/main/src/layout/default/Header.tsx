import type { MessageDescriptor } from '@lingui/core'

import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { msg, t } from '@lingui/macro'
import { i18n } from '@lingui/core'

import { Locale } from '@/lib/i18n'
import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { parseParams } from '@/utils/utilsRouter'
import networks, { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import ConnectWallet from '@/components/ConnectWallet'
import CurveLogoLink from '@/layout/default/CurveLogoLink'
import DividerHorizontal from '@/ui/DividerHorizontal'
import HeaderMobile from '@/layout/default/HeaderMobile'
import HeaderSecondary from '@/layout/default/HeaderSecondary'
import SelectNetwork from '@/ui/Select/SelectNetwork'
import ExternalLink from '@/ui/Link/ExternalLink'

export type Page = {
  route: string
  label: MessageDescriptor
}

const PAGES: Page[] = [
  { route: ROUTE.PAGE_SWAP, label: msg`Swap` },
  { route: ROUTE.PAGE_POOLS, label: msg`Pools` },
  { route: ROUTE.PAGE_CREATE_POOL, label: msg`Pool Creation` },
  { route: ROUTE.PAGE_DASHBOARD, label: msg`Dashboard` },
  { route: ROUTE.PAGE_INTEGRATIONS, label: msg`Integrations` },
]

const Header = (pageProps: PageProps) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const isMdUp = useStore((state) => state.isMdUp)
  const pageWidth = useStore((state) => state.pageWidth)
  const routerProps = useStore((state) => state.routerProps)
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)

  const { params, location } = routerProps || {}
  const { rChainId, rLocale, rPoolId } = parseParams(params, location)
  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const pages = useMemo(() => {
    const routerDefault = rChainId ? networks[rChainId].swap : {}
    const routerFromAddress = routerCached?.fromAddress ?? routerDefault?.fromAddress ?? ''
    const routerToAddress = routerCached?.toAddress ?? routerDefault?.toAddress ?? ''

    let swapRoute = ROUTE.PAGE_SWAP
    if (routerFromAddress && routerToAddress) {
      swapRoute += `?from=${routerFromAddress}&to=${routerToAddress}`
    } else if (routerFromAddress) {
      swapRoute += `?from=${routerFromAddress}`
    } else if (routerToAddress) {
      swapRoute += `?to=${routerToAddress}`
    }

    PAGES[0].route = swapRoute

    if (rChainId && typeof hasRouter !== 'undefined') {
      return PAGES.filter((page) => {
        if (page.route.includes(ROUTE.PAGE_SWAP)) {
          return hasRouter
        }
        return networks[rChainId].excludeRoutes.indexOf(page.route) === -1
      })
    }
    return PAGES
  }, [rChainId, hasRouter, routerCached])

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    if (rLocale.pathnameLocale && networkName) {
      return `#/${rLocale.pathnameLocale}/${networkName}${route}`
    }
    return `#/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      updateWalletStoreByKey('isNetworkChangedFromApp', true)
      const selectedNetworkName = networks[selectedChainId as ChainId]?.id

      if (location?.pathname && selectedNetworkName) {
        let redirectPathname
        if (rChainId && params?.network) {
          if (rPoolId) {
            redirectPathname = parsePoolPathname(rLocale, selectedNetworkName)
          } else if (location.pathname.endsWith(ROUTE.PAGE_POOLS)) {
            redirectPathname = `${parsePoolPathname(rLocale, selectedNetworkName)}${location.search}`
          } else {
            redirectPathname = location.pathname.replace(`/${params.network}`, `/${selectedNetworkName}`)
          }
        } else {
          redirectPathname = parseNonNetworkWithLocalePathname(rLocale, selectedNetworkName, location.pathname)
        }
        updateGlobalStoreByKey('isLoadingApi', true)
        navigate(redirectPathname)
      }
    }
  }

  const SelectNetworkComp = (
    <StyledSelectNetwork
      buttonStyles={{ textTransform: 'uppercase' }}
      items={visibleNetworksList}
      minWidth="9rem"
      mobileRightAlign
      selectedKey={(rChainId || '').toString()}
      onSelectionChange={handleNetworkChange}
    />
  )

  return (
    <>
      {isMdUp && <HeaderSecondary rChainId={rChainId} />}
      <StyledNavBar as="nav" ref={mainNavRef} aria-label="Main menu" flex flexAlignItems="stretch" isMdUp={isMdUp}>
        <NavBarContent
          className="nav-content"
          grid
          gridAutoFlow="column"
          flexJustifyContent="space-between"
          pageWidth={pageWidth}
        >
          {isMdUp ? (
            <>
              <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-2)" flexAlignItems="center">
                <CurveLogoLink />
                {pages.map(({ route, label }) => {
                  let isActive = false
                  if (location?.pathname) {
                    if (route === ROUTE.PAGE_SWAP) {
                      isActive = !location.pathname.includes('/pools/') && !!location.pathname.endsWith(route)
                    } else {
                      isActive = !!location.pathname.endsWith(route)
                    }
                  }

                  return (
                    <InternalLinkText as="a" key={route} className={isActive ? 'active' : ''} href={getPath(route)}>
                      {i18n._(label)}
                    </InternalLinkText>
                  )
                })}
                <DividerHorizontal />
                <ExternalLinkText href="https://crvusd.curve.fi">{t`crvUSD`}</ExternalLinkText>
              </Menu>

              <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-2)" flexAlignItems="center">
                {SelectNetworkComp}
                <ConnectWallet />
              </Menu>
            </>
          ) : (
            <HeaderMobile {...pageProps} pages={pages} rChainId={rChainId} selectNetwork={SelectNetworkComp} />
          )}
        </NavBarContent>
      </StyledNavBar>
    </>
  )
}

const InternalLinkText = styled(Chip)`
  align-items: center;
  display: flex;
  min-height: var(--height-medium);
  padding: 0 0.5rem;

  color: inherit;
  font-weight: var(--font-weight--bold);
  text-decoration: none;

  :active {
    transform: none;
  }

  :hover {
    color: var(--nav_link--hover--color);
    background-color: var(--nav_link--hover--background-color);
  }

  &.active,
  &.active:hover {
    color: var(--nav_link--active--hover--color);
    background-color: var(--nav_link--active--hover--background-color);
  }
`

const ExternalLinkText = styled(ExternalLink)`
  align-items: center;
  display: flex;
  min-height: var(--height-medium);
  padding: 0 0.5rem;

  color: inherit;
  font-weight: var(--font-weight--bold);
  text-decoration: none;

  :active {
    transform: none;
  }

  :hover {
    color: var(--nav_link--hover--color);
    background-color: var(--nav_link--hover--background-color);
  }

  &.active,
  &.active:hover {
    color: var(--nav_link--active--hover--color);
    background-color: var(--nav_link--active--hover--background-color);
  }
`

export const Menu = styled(Box)<{ gridColumnGap?: string }>`
  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
`

type NavBarContentProps = {
  pageWidth: PageWidthClassName | null
}

const NavBarContent = styled(Box)<NavBarContentProps>`
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-narrow);
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    padding: 0 var(--spacing-normal);
  }
`

const NavBar = styled(Box)<{ isMdUp: boolean }>`
  height: var(--header-height);
  //position: sticky;
  top: ${({ isMdUp }) => (isMdUp ? 'var(--top-nav-bottom)' : '0')};

  font-size: var(--font-size-2);
  text-transform: uppercase;

  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page-nav);
`

const StyledNavBar = styled(NavBar)`
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 20%);
`

const StyledSelectNetwork = styled(SelectNetwork)`
  && {
    height: var(--height-medium);
  }
`

function parsePoolPathname(
  { pathnameLocale }: { parsedLocale: Locale['value']; pathnameLocale: string },
  selectedNetworkName: string
) {
  return pathnameLocale ? `/${pathnameLocale}/${selectedNetworkName}/pools` : `/${selectedNetworkName}/pools`
}

function parseNonNetworkWithLocalePathname(
  { pathnameLocale }: { parsedLocale: Locale['value']; pathnameLocale: string },
  selectedNetworkName: string,
  pathname: string
) {
  if (pathnameLocale) {
    const parsedPathname = pathname.replace(`/${pathnameLocale}`, '')
    return `/${pathnameLocale}/${selectedNetworkName}${parsedPathname}`
  } else {
    return `/${selectedNetworkName}${pathname}`
  }
}

export default Header
