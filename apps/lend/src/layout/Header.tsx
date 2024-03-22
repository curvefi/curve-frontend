import type { AppLogoProps } from '@/ui/Brand/AppLogo'

import React, { useEffect, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, CURVE_FI_ROUTE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getNetworkFromUrl, getRestFullPathname } from '@/utils/utilsRouter'
import { getParamsFromUrl, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { isLoading } from '@/ui/utils'
import { useConnectWallet } from '@/onboard'
import { useHeightResizeObserver } from '@/ui/hooks'
import { visibleNetworksList } from '@/networks'
import networks from '@/networks'
import useStore from '@/store/useStore'

import {
  APP_LINK,
  APPS_LINKS,
  AppNavBar,
  AppNavBarContent,
  AppNavMenuSection,
  AppNavMobile,
  AppSelectNetwork,
} from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/Footer'
import AppLogo from '@/ui/Brand/AppLogo'
import AppNavPages from '@/ui/AppNav/AppNavPages'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import HeaderSecondary from '@/layout/HeaderSecondary'

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  const elHeight = useHeightResizeObserver(mainNavRef)

  const connectState = useStore((state) => state.connectState)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isLgUp = useStore((state) => state.layout.isLgUp)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { rChainId, rNetwork, rNetworkIdx, rLocalePathname } = getParamsFromUrl()

  const network = networks[rChainId].id
  const appLogoProps: AppLogoProps = {
    showBeta: true,
    appName: 'LlamaLend',
    pathname: CURVE_FI_ROUTE.MAIN,
    internalPathname: `${rLocalePathname}/${network}${ROUTE.PAGE_MARKETS}`,
  }

  const p = [
    { route: ROUTE.PAGE_MARKETS, label: t`Markets` },
    { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
    { ...APP_LINK.main, isDivider: true },
    APP_LINK.crvusd,
  ]

  const pages = p.map(({ route, ...rest }) => {
    const parsedRoute = route.startsWith('http') ? route : `#${rLocalePathname}/${rNetwork}${route}`
    return { route: parsedRoute, isActive: false, ...rest }
  })

  const desktopPages = pages.map(({ route, ...rest }) => {
    const routerPathname = routerProps?.location?.pathname.split('?')[0] ?? ''
    const routePathname = route.split('?')[0] ?? ''
    return {
      ...rest,
      route,
      isActive: routerPathname && routePathname ? routePathname.endsWith(routerPathname) : false,
    }
  })

  const appStats = [] as { label: string; value: string }[]

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

  useEffect(() => {
    setLayoutHeight('mainNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  const SelectNetworkComp = (
    <AppSelectNetwork
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
    process.env.NODE_ENV === 'development'
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
      {isLgUp && (
        <HeaderSecondary
          advancedMode={appNavAdvancedMode}
          appsLinks={APPS_LINKS}
          appStats={appStats}
          locale={appNavLocale}
          theme={appNavTheme}
        />
      )}
      <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isLgUp}>
        <AppNavBarContent pageWidth={pageWidth} className="nav-content">
          {isLgUp ? (
            <>
              <AppNavMenuSection>
                <AppLogo showBeta {...appLogoProps} />
                <AppNavPages pages={desktopPages} />
              </AppNavMenuSection>

              <AppNavMenuSection>
                {SelectNetworkComp}
                <ConnectWallet {...appNavConnect} />
              </AppNavMenuSection>
            </>
          ) : (
            <AppNavMobile
              appLogoProps={appLogoProps}
              advancedMode={appNavAdvancedMode}
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
                { id: 'apps', title: t`Apps`, links: APPS_LINKS },
                { id: 'community', title: t`Community`, comp: <CommunitySection locale={locale} columnCount={1} /> },
                { id: 'resources', title: t`Resources`, comp: <ResourcesSection chainId={rChainId} columnCount={1} /> },
              ]}
              selectNetwork={SelectNetworkComp}
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
