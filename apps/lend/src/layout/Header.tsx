import { t } from '@lingui/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import React, { useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'

import { CONNECT_STAGE, CURVE_FI_ROUTE, ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getNetworkFromUrl, getRestFullPathname } from '@/utils/utilsRouter'
import { getParamsFromUrl, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { isLoading } from '@/ui/utils'
import { useConnectWallet } from '@/onboard'
import { useHeightResizeObserver } from '@/ui/hooks'
import { visibleNetworksList } from '@/networks'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import AppLogo, { AppLogoProps } from '@/ui/Brand/AppLogo'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import HeaderMobile from '@/layout/HeaderMobile'
import HeaderSecondary from '@/layout/HeaderSecondary'
import SelectNetwork from '@/ui/Select/SelectNetwork'

export type Page = {
  route: string
  label: string
}

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const elHeight = useHeightResizeObserver(mainNavRef)

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { rChainId, rNetworkIdx, rLocale, rLocalePathname } = getParamsFromUrl()

  const network = networks[rChainId].id
  const appLogoProps: AppLogoProps = {
    showBeta: true,
    appName: 'LlamaLend',
    pathname: CURVE_FI_ROUTE.MAIN,
    internalPathname: `${rLocalePathname}/${network}${ROUTE.PAGE_MARKETS}`,
  }

  const pages = [
    { route: ROUTE.PAGE_MARKETS, label: t`Markets` },
    { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
  ]

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
    }
  }

  const handleConnectWallet = (wallet: Wallet | null) => {
    if (wallet) {
      updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET)
    } else {
      updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])
    }
  }

  useEffect(() => {
    setLayoutHeight('mainNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  const SelectNetworkComp = (
    <StyledSelectNetwork
      connectState={connectState}
      buttonStyles={{ textTransform: 'uppercase' }}
      items={visibleNetworksList}
      loading={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
      minWidth="9rem"
      mobileRightAlign
      selectedKey={(rNetworkIdx === -1 ? '' : rChainId).toString()}
      onSelectionChange={handleNetworkChange}
    />
  )

  const handleLocaleChange = (selectedLocale: React.Key) => {
    const locale = selectedLocale !== 'en' ? `/${selectedLocale}` : ''
    const { rNetwork } = getNetworkFromUrl()
    navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
  }

  return (
    <>
      {isMdUp && <HeaderSecondary handleLocaleChange={handleLocaleChange} />}
      <StyledNavBar as="nav" ref={mainNavRef} aria-label="Main menu" flex flexAlignItems="stretch" isMdUp={isMdUp}>
        <NavBarContent className="nav-content" grid gridAutoFlow="column" flexJustifyContent="space-between">
          {isMdUp ? (
            <>
              <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
                <Box grid gridTemplateColumns="auto auto" flexAlignItems="center">
                  <AppLogo showBeta {...appLogoProps} />
                </Box>
                {pages.map(({ route, label }) => {
                  let isActive = false
                  const { pathname } = location || {}

                  if (pathname) {
                    isActive = pathname.endsWith(route)

                    return (
                      <InternalLinkText as="a" key={route} className={isActive ? 'active' : ''} href={getPath(route)}>
                        {label}
                      </InternalLinkText>
                    )
                  }
                  return null
                })}
                {/*<DividerHorizontal />*/}
                {/*<ExternalLinkText target="_self" href={CURVE_FI_ROUTE.CRVUSD_POOLS}>{t`crvUSD Pools`}</ExternalLinkText>*/}
              </Menu>

              <Menu grid gridAutoFlow="column" gridColumnGap={2} flexAlignItems="center">
                {SelectNetworkComp}
                <ConnectWallet
                  connectState={connectState}
                  walletSignerAddress={getWalletSignerAddress(wallet)}
                  handleClick={() => handleConnectWallet(wallet)}
                />
              </Menu>
            </>
          ) : (
            <HeaderMobile
              appLogoProps={appLogoProps}
              pages={pages}
              selectNetwork={SelectNetworkComp}
              handleConnectWallet={handleConnectWallet}
              handleLocaleChange={handleLocaleChange}
            />
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

export const Menu = styled(Box)`
  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
`

const NavBarContent = styled(Box)`
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-narrow) 0 0;
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
