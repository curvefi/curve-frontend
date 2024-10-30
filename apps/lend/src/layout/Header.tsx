import AppLogo from '@/ui/Brand/AppLogo'
import type { AppPage } from '@/ui/AppNav/types'

import React, { useEffect, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { ConnectWalletIndicator, getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import { useHeightResizeObserver } from '@/ui/hooks'
import networks, { visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'

import { APP_LINK, AppNavBar, AppNavBarContent, AppNavMenuSection, AppNavMobile, APPS_LINKS } from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/Footer'
import AppNavPages from '@/ui/AppNav/AppNavPages'
import HeaderSecondary from '@/layout/HeaderSecondary'
import { useTvl } from '@/entities/chain'
import { ChainSwitcher } from '@/common/features/switch-chain'
import { LanguageSwitcher } from '@/common/features/switch-language'


const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  const elHeight = useHeightResizeObserver(mainNavRef)

  const { rChainId, rLocalePathname } = getParamsFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isLgUp = useStore((state) => state.layout.isLgUp)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const { data: tvl } = useTvl(rChainId);

  const { params: routerParams, location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network

  const pages: AppPage[] = useMemo(() =>
    _parseRouteAndIsActive([
      { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: 'markets' },
      {
        route: ROUTE.PAGE_INTEGRATIONS,
        label: t`Integrations`,
        groupedTitle: isLgUp ? 'Others' : 'More', ...!isLgUp && { minWidth: '10rem' }
      },
      { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: isLgUp ? 'risk' : 'More' }
    ], rLocalePathname, routerPathname, routerNetwork), [isLgUp, rLocalePathname, routerNetwork, routerPathname])

  const apps: AppPage[] = useMemo(() =>
    _parseRouteAndIsActive([APP_LINK.main, APP_LINK.lend, APP_LINK.crvusd],
      rLocalePathname, routerPathname, routerNetwork), [rLocalePathname, routerNetwork, routerPathname])

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: ChainId) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      const [currPath] = window.location.hash.split('?')

      if (currPath.endsWith('markets')) {
        // include search params when in market list page
        navigate(`${rLocalePathname}/${network}/${getRestFullPathname()}`)
      } else {
        navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      }

      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
    }
  }

  useEffect(() => {
    setLayoutHeight('mainNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  const selectNetworkComp = (
    <ChainSwitcher
      options={visibleNetworksList}
      disabled={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
      chainId={rChainId}
      onChange={handleNetworkChange}
    />
  )

  const appNavAdvancedMode = {
    isAdvanceMode,
    handleClick: () => setAppCache('isAdvanceMode', !isAdvanceMode),
  }

  const appNavConnect = {
    connectState,
    walletSignerAddress: getWalletSignerAddress(wallet),
    handleClick: () => {
      if (wallet) {
        updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET)
      } else {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])
      }
    },
  }

  const appNavLocale =
    DEFAULT_LOCALES.length > 1
      ? {
          locale,
          locales: DEFAULT_LOCALES,
          handleChange: (selectedLocale: React.Key) => {
            const locale = selectedLocale !== 'en' ? `/${selectedLocale}` : ''
            const { rNetwork } = getNetworkFromUrl()
            navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
          },
        }
      : undefined

  const appNavTheme = {
    themeType,
    handleClick: (selectedThemeType: Theme) => setAppCache('themeType', selectedThemeType),
  }

  return (
    <>
      {isMdUp && (
        <HeaderSecondary
          advancedMode={appNavAdvancedMode}
          appsLinks={APPS_LINKS}
          appStats={[{ label: 'TVL', value: tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) || '' }]}
          theme={appNavTheme}
        />
      )}
      <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isMdUp}>
        <AppNavBarContent pageWidth={pageWidth} className="nav-content">
          {isMdUp ? (
            <>
              <AppNavMenuSection>
                <AppLogo />
                <AppNavPages pages={pages} apps={apps} />
              </AppNavMenuSection>

              <AppNavMenuSection>
                {appNavLocale && (
                  <LanguageSwitcher languageCode={appNavLocale.locale} languageOptions={DEFAULT_LOCALES} onChange={appNavLocale.handleChange} />
                )}
                {selectNetworkComp}
                <ConnectWalletIndicator
                  onConnectWallet={appNavConnect.handleClick}
                  onDisconnectWallet={appNavConnect.handleClick}
                  walletAddress={appNavConnect.walletSignerAddress}
                  disabled={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
                />
              </AppNavMenuSection>
            </>
          ) : (
            <AppNavMobile
              advancedMode={appNavAdvancedMode}
              connect={appNavConnect}
              locale={appNavLocale}
              pageWidth={pageWidth}
              pages={{
                pages,
                apps,
                getPath,
                handleClick: (route: string) => {
                  if (navigate && params) {
                    let parsedRoute = route.charAt(0) === '#' ? route.substring(2) : route
                    navigate(parsedRoute)
                  }
                },
              }}
              sections={[
                { id: 'apps', title: t`Apps`, links: APPS_LINKS },
                { id: 'community', title: t`Community`, comp: <CommunitySection locale={locale} columnCount={1} /> },
                { id: 'resources', title: t`Resources`, comp: <ResourcesSection chainId={rChainId} columnCount={1} /> },
              ]}
              selectNetwork={selectNetworkComp}
              stats={[]}
              theme={appNavTheme}
            />
          )}
        </AppNavBarContent>
      </AppNavBar>
    </>
  )
}

export default Header
