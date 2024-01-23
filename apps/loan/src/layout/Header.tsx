import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import React, { useRef } from 'react'
import styled, { css } from 'styled-components'

import { CURVE_FI_ROUTE, ROUTE } from '@/constants'
import { parseLocale } from '@/lib/i18n'
import { parseParams } from '@/utils/utilsRouter'
import { breakpoints } from '@/ui/utils/responsive'
import { visibleNetworksList } from '@/networks'
import networks from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import ConnectWallet from '@/components/ConnectWallet'
import BrandingLink from '@/components/BrandingLink'
import DividerHorizontal from '@/ui/DividerHorizontal'
import ExternalLink from '@/ui/Link/ExternalLink'
import HeaderMobile from '@/layout/HeaderMobile'
import HeaderSecondary from '@/layout/HeaderSecondary'
import SelectNetwork from '@/ui/Select/SelectNetwork'

export type Page = {
  route: string
  label: string
}

const Header = ({ chainId }: { chainId: ChainId | undefined }) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const routerProps = useStore((state) => state.routerProps)
  const setWalletStoreByKey = useStore((state) => state.wallet.setStateByKey)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)

  const { params = {}, location } = routerProps || {}
  const { rChainId = '1' } = parseParams(params, location)
  const { pathnameLocale } = parseLocale(params?.locale)
  const network = networks[rChainId as ChainId]?.id
  const pages = [
    { route: ROUTE.PAGE_MARKETS, label: t`Markets` },
    { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
  ]

  const handleNetworkChange = (selectedNetwork: React.Key) => {
    const numSelectedNetwork = Number(selectedNetwork)

    if (rChainId !== numSelectedNetwork) {
      setWalletStoreByKey('isNetworkChangedFromApp', true)
      const updatedNetworkName = networks[selectedNetwork as ChainId]?.id

      if (location?.pathname && params?.network && updatedNetworkName) {
        let redirectPathname
        if (params.pool) {
          const { pathnameLocale } = parseLocale(params?.locale)
          redirectPathname = pathnameLocale
            ? `/${pathnameLocale}/${updatedNetworkName}/pools`
            : `/${updatedNetworkName}/pools`
        } else {
          redirectPathname = location.pathname.replace(`/${params.network}`, `/${updatedNetworkName}`)
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
      {isMdUp && <HeaderSecondary />}
      <StyledNavBar as="nav" ref={mainNavRef} aria-label="Main menu" flex flexAlignItems="stretch" isMdUp={isMdUp}>
        <NavBarContent className="nav-content" grid gridAutoFlow="column" flexJustifyContent="space-between">
          {isMdUp ? (
            <>
              <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
                <BrandingLink pathname={CURVE_FI_ROUTE.MAIN} />
                {pages.map(({ route, label }) => {
                  let isActive = false
                  const { pathname } = location || {}

                  if (pathname) {
                    isActive = pathname.endsWith(route)

                    let url = `#/`

                    if (pathnameLocale && network) {
                      url = `#/${pathnameLocale}/${network}${route}`
                    } else if (network) {
                      url = `#/${network}${route}`
                    }

                    return (
                      <InternalLinkText as="a" key={route} className={isActive ? 'active' : ''} href={url}>
                        {label}
                      </InternalLinkText>
                    )
                  }
                  return null
                })}
                <DividerHorizontal />
                <ExternalLinkText target="_self" href={CURVE_FI_ROUTE.CRVUSD_POOLS}>{t`crvUSD Pools`}</ExternalLinkText>
              </Menu>

              <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
                {SelectNetworkComp}
                <ConnectWallet />
              </Menu>
            </>
          ) : (
            <HeaderMobile pages={pages} selectNetwork={SelectNetworkComp} />
          )}
        </NavBarContent>
      </StyledNavBar>
    </>
  )
}

const headerLinkCss = css`
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

const InternalLinkText = styled(Chip)`
  ${headerLinkCss};
`

const ExternalLinkText = styled(ExternalLink)`
  ${headerLinkCss};
`

export const Menu = styled(Box)`
  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
`

const NavBarContent = styled(Box)`
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-narrow);
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    padding: 0 var(--spacing-normal);
  }
`

type NavBarProps = {
  isMdUp: boolean
}

const NavBar = styled(Box)<NavBarProps>`
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

export default Header
