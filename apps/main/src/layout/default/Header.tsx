import type { AppLogoProps } from '@/ui/Brand/AppLogo'
import type { AppPage } from '@/ui/AppNav/types'
import type { ThemeType } from '@/ui/Select/SelectThemes'

import React, { useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, isLoading, useConnectWallet } from '@/onboard'
import { ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import networks, { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import {
  APP_LINK,
  APPS_LINKS,
  AppNavMobile,
  AppNavBarContent,
  AppNavBar,
  AppNavMenuSection,
  AppSelectNetwork,
} from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/default/Footer'
import AppLogo from '@/ui/Brand'
import AppNavPages from '@/ui/AppNav/AppNavPages'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import HeaderSecondary from '@/layout/default/HeaderSecondary'

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetworkIdx, rNetwork, rLocalePathname } = getParamsFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const isLgUp = useStore((state) => state.isLgUp)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.pageWidth)
  const tvlTotalCached = useStore((state) => state.storeCache.tvlTotal?.[rChainId])
  const tvlTotal = useStore((state) => state.pools.tvlTotal)
  const volumeTotalCached = useStore((state) => state.storeCache.volumeTotal?.[rChainId])
  const volumeTotal = useStore((state) => state.pools.volumeTotal)
  const volumeCryptoShareCached = useStore((state) => state.storeCache.volumeCryptoShare?.[rChainId])
  const volumeCryptoShare = useStore((state) => state.pools.volumeCryptoShare)
  const themeType = useStore((state) => state.themeType)
  const setThemeType = useStore((state) => state.setThemeType)
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const routerProps = useStore((state) => state.routerProps)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const { location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''

  const appLogoProps: AppLogoProps = {
    appName: '',
  }

  // prettier-ignore
  const appStats = [
    { label: t`Total Deposits`, value: formatNumber(tvlTotal ?? tvlTotalCached, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
    { label: t`Daily Volume`, value: formatNumber(volumeTotal ?? volumeTotalCached, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
    { label: t`Crypto Volume Share`, value: formatNumber(volumeCryptoShare ?? volumeCryptoShareCached, FORMAT_OPTIONS.PERCENT) },
  ]

  const pages: AppPage[] = useMemo(() => {
    const links = isLgUp
      ? [
          { route: ROUTE.PAGE_POOLS, label: t`Pools`, groupedTitle: 'Pools' },
          { route: ROUTE.PAGE_CREATE_POOL, label: t`Pool Creation`, groupedTitle: 'Pool Creation' },
          { route: ROUTE.PAGE_DASHBOARD, label: t`Dashboard`, groupedTitle: 'Dashboard' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'Integrations' },
          { ...APP_LINK.crvusd, isDivider: true },
          APP_LINK.lend,
        ]
      : [
          { route: ROUTE.PAGE_POOLS, label: t`Pools`, groupedTitle: 'Pools' },
          { route: ROUTE.PAGE_DASHBOARD, label: t`Dashboard`, groupedTitle: 'More' },
          { route: ROUTE.PAGE_CREATE_POOL, label: t`Pool Creation`, groupedTitle: 'More' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'More' },
          { ...APP_LINK.crvusd, isDivider: true },
          APP_LINK.lend,
        ]

    if (hasRouter && networks[rChainId].showRouterSwap) {
      const parsedSwapRoute = _parseSwapRoute(rChainId, ROUTE.PAGE_SWAP, routerCached)
      links.unshift({ route: parsedSwapRoute, label: t`Swap`, groupedTitle: 'Swap' })
    }

    return _parseRouteAndIsActive(links, rLocalePathname, routerPathname, rNetwork)
  }, [hasRouter, isLgUp, rChainId, rLocalePathname, routerCached, rNetwork, routerPathname])

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, Number(selectedChainId)])
    }
  }

  const appNavConnect = {
    connectState,
    walletSignerAddress: getWalletSignerAddress(wallet),
    handleClick: () => {
      if (wallet) {
        updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET)
      } else {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, '')
      }
    },
  }

  const SelectNetworkComp = (
    <AppSelectNetwork
      buttonStyles={{ textTransform: 'uppercase' }}
      items={visibleNetworksList}
      loading={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
      minWidth="9rem"
      mobileRightAlign
      selectedKey={(rNetworkIdx === -1 ? '' : rChainId).toString()}
      isDarkTheme={themeType === 'dark'}
      onSelectionChange={handleNetworkChange}
    />
  )

  const appNavLocale = {
    locale,
    locales: DEFAULT_LOCALES,
    handleChange: (selectedLocale: React.Key) => {
      const locale = selectedLocale !== 'en' ? `/${selectedLocale}` : ''
      const { rNetwork } = getNetworkFromUrl()
      navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
    },
  }

  const appNavTheme = {
    themeType,
    handleClick: (selectedThemeType: ThemeType) => setThemeType(selectedThemeType),
  }

  const appsLinks = [APP_LINK.classicMain, ...APPS_LINKS]

  return (
    <>
      {isMdUp && (
        <HeaderSecondary appsLinks={appsLinks} appStats={appStats} locale={appNavLocale} theme={appNavTheme} />
      )}
      <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isMdUp}>
        <AppNavBarContent pageWidth={pageWidth} className="nav-content">
          {isMdUp ? (
            <>
              <AppNavMenuSection>
                <AppLogo {...appLogoProps} />
                <AppNavPages pages={pages} navigate={navigate} />
              </AppNavMenuSection>

              <AppNavMenuSection>
                {SelectNetworkComp}
                <ConnectWallet {...appNavConnect} />
              </AppNavMenuSection>
            </>
          ) : (
            <AppNavMobile
              appLogoProps={appLogoProps}
              connect={appNavConnect}
              locale={appNavLocale}
              pageWidth={pageWidth}
              pages={{
                pages,
                getPath,
                handleClick: (route: string) => {
                  if (navigate && params) {
                    let parsedRoute = route.charAt(0) === '#' ? route.substring(2) : route
                    navigate(parsedRoute)
                  }
                },
              }}
              sections={[
                { id: 'apps', title: t`Apps`, links: appsLinks },
                { id: 'community', title: t`Community`, comp: <CommunitySection locale={locale} columnCount={1} /> },
                { id: 'resources', title: t`Resources`, comp: <ResourcesSection chainId={rChainId} columnCount={1} /> },
              ]}
              selectNetwork={SelectNetworkComp}
              stats={appStats}
              theme={appNavTheme}
            />
          )}
        </AppNavBarContent>
      </AppNavBar>
    </>
  )
}

function _parseSwapRoute(
  rChainId: ChainId,
  route: string,
  routerCached: { fromAddress: string; fromToken: string; toAddress: string; toToken: string } | undefined
) {
  const routerDefault = rChainId ? networks[rChainId].swap : {}
  const routerFromAddress = routerCached?.fromAddress ?? routerDefault?.fromAddress ?? ''
  const routerToAddress = routerCached?.toAddress ?? routerDefault?.toAddress ?? ''

  if (routerFromAddress && routerToAddress) {
    route += `?from=${routerFromAddress}&to=${routerToAddress}`
  } else if (routerFromAddress) {
    route += `?from=${routerFromAddress}`
  } else if (routerToAddress) {
    route += `?to=${routerToAddress}`
  }
  return route
}

export default Header
