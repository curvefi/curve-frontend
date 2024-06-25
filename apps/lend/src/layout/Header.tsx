import type { AppLogoProps } from '@/ui/Brand/AppLogo'
import type { AppPage } from '@/ui/AppNav/types'

import React, { useEffect, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, isLoading, useConnectWallet } from '@/onboard'
import { ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { useHeightResizeObserver } from '@/ui/hooks'
import networks, { visibleNetworksList } from '@/networks'
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

  const { rChainId, rNetworkIdx, rNetwork, rLocalePathname } = getParamsFromUrl()

  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[rChainId])
  const marketsCollateralMapper = useStore((state) => state.markets.statsAmmBalancesMapper[rChainId])
  const marketsTotalSupplyMapper = useStore((state) => state.markets.totalLiquidityMapper[rChainId])
  const marketsTotalDebtMapper = useStore((state) => state.markets.statsTotalsMapper[rChainId])
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
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

  const { location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''

  const appLogoProps: AppLogoProps = {
    showBeta: true,
    appName: 'LlamaLend',
  }

  const pages: AppPage[] = useMemo(() => {
    const links = isLgUp
      ? [
          { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: 'markets' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'Others' },
          { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: 'risk' },
          { ...APP_LINK.main, isDivider: true },
          APP_LINK.crvusd,
        ]
      : [
          { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: 'markets' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'More', minWidth: '10rem' },
          { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: 'More' },
          { ...APP_LINK.main, isDivider: true },
          APP_LINK.crvusd,
        ]

    return _parseRouteAndIsActive(links, rLocalePathname, routerPathname, rNetwork)
  }, [isLgUp, rLocalePathname, rNetwork, routerPathname])

  const tvl = useMemo(() => {
    return _getTvl(
      owmDatasMapper,
      marketsCollateralMapper,
      marketsTotalSupplyMapper,
      marketsTotalDebtMapper,
      usdRatesMapper
    )
  }, [owmDatasMapper, marketsCollateralMapper, marketsTotalSupplyMapper, marketsTotalDebtMapper, usdRatesMapper])

  const appStats = [{ label: 'TVL', value: tvl }] as { label: string; value: string }[]

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      const [currPath] = window.location.hash.split('?')

      if (currPath.endsWith('markets')) {
        // include search params when in market list page
        navigate(`${rLocalePathname}/${network}/${getRestFullPathname()}`)
      } else {
        navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      }

      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, Number(selectedChainId)])
    }
  }

  useEffect(() => {
    setLayoutHeight('mainNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  const SelectNetworkComp = (
    <AppSelectNetwork
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
        updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, '')
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
      {isMdUp && (
        <HeaderSecondary
          advancedMode={appNavAdvancedMode}
          appsLinks={APPS_LINKS}
          appStats={appStats}
          locale={appNavLocale}
          theme={appNavTheme}
        />
      )}
      <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isMdUp}>
        <AppNavBarContent pageWidth={pageWidth} className="nav-content">
          {isMdUp ? (
            <>
              <AppNavMenuSection>
                <AppLogo showBeta {...appLogoProps} />
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

function _getTvl(
  owmDatasMapper: OWMDatasMapper | undefined,
  marketsCollateralMapper: MarketsStatsAMMBalancesMapper | undefined,
  marketsTotalSupplyMapper: MarketsTotalLiquidityMapper | undefined,
  marketsTotalDebtMapper: MarketsStatsTotalsMapper | undefined,
  usdRatesMapper: { [tokenAddress: string]: string | number }
) {
  if (
    owmDatasMapper &&
    marketsCollateralMapper &&
    marketsTotalSupplyMapper &&
    marketsTotalDebtMapper &&
    Object.keys(usdRatesMapper)
  ) {
    let totalCollateral = 0
    let totalLiquidity = 0
    let totalDebt = 0

    Object.values(owmDatasMapper).map(({ owm }) => {
      const { id, collateral_token } = owm

      const ammBalance = marketsCollateralMapper[id] ?? {}
      const collateralUsdRate = usdRatesMapper[collateral_token.address]
      const marketTotalCollateralUsd = +(ammBalance?.collateral ?? '0') * +(collateralUsdRate ?? '0')

      totalCollateral += marketTotalCollateralUsd
      totalDebt += +marketsTotalDebtMapper[id]?.totalDebt
      totalLiquidity += +marketsTotalSupplyMapper[id]?.totalLiquidity
    })

    const tvl = totalCollateral + totalLiquidity - totalDebt

    return tvl > 0 ? formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) : '-'
  }
}

export default Header
