import type { AppLogoProps } from '@/ui/Brand/AppLogo'
import type { AppPage } from '@/ui/AppNav/types'

import React, { useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, isLoading, useConnectWallet } from '@/onboard'
import { CRVUSD_ADDRESS, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getLocaleFromUrl, getNetworkFromUrl, getPath, getRestFullPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { _parseRouteAndIsActive, formatNumber } from '@/ui/utils'
import { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import {
  APP_LINK,
  APPS_LINKS,
  AppNavMobile,
  AppNavBar,
  AppNavBarContent,
  AppNavMenuSection,
  AppSelectNetwork,
} from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/Footer'
import AppLogo from '@/ui/Brand'
import AppNavPages from '@/ui/AppNav/AppNavPages'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import HeaderSecondary from '@/layout/HeaderSecondary'

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetworkIdx, rNetwork } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const crvusdTotalSupply = useStore((state) => state.crvusdTotalSupply)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isLgUp = useStore((state) => state.layout.isLgUp)
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const locale = useStore((state) => state.locale)
  const pageWidth = useStore((state) => state.layout.pageWidth)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const rLocale = getLocaleFromUrl()
  const { location } = routerProps ?? {}

  const routerPathname = location?.pathname ?? ''

  const appLogoProps: AppLogoProps = {
    appName: 'Crvusd',
  }

  const pages: AppPage[] = useMemo(() => {
    const links = isLgUp
      ? [
          { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: 'markets' },
          { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: 'risk' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'integrations' },
          { ...APP_LINK.main, isDivider: true },
          APP_LINK.lend,
        ]
      : [
          { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: 'markets' },
          { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations`, groupedTitle: 'More', minWidth: '10rem' },
          { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: 'More' },
          { ...APP_LINK.main, isDivider: true },
          APP_LINK.lend,
        ]

    return _parseRouteAndIsActive(links, rLocale.rLocalePathname, routerPathname, rNetwork ?? 'ethereum')
  }, [isLgUp, rLocale.rLocalePathname, rNetwork, routerPathname])

  const formattedTvl = useMemo(
    () => _getTvl(collateralDatasMapper, loansDetailsMapper, usdRatesMapper),
    [collateralDatasMapper, loansDetailsMapper, usdRatesMapper]
  )

  // prettier-ignore
  const appStats = [
    { label: 'TVL', value: formattedTvl },
    { label: t`crvUSD Total Supply`, value: formatNumber(crvusdTotalSupply?.total, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
    { label: 'crvUSD', value: formatNumber(crvusdPrice) || '' },
  ]

  const SelectNetworkComp = (
    <AppSelectNetwork
      buttonStyles={{ textTransform: 'uppercase' }}
      items={visibleNetworksList}
      loading={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
      minWidth="9rem"
      mobileRightAlign
      selectedKey={(rNetworkIdx === -1 ? '' : rChainId).toString()}
      onSelectionChange={() => {}}
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
              advancedMode={appNavAdvancedMode}
              connect={appNavConnect}
              locale={appNavLocale}
              pageWidth={pageWidth}
              pages={{
                pages,
                getPath: (route: string) => getPath(params, route),
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
              stats={appStats}
              theme={appNavTheme}
            />
          )}
        </AppNavBarContent>
      </AppNavBar>
    </>
  )
}

function _getTvl(
  collateralDatasMapper: CollateralDatasMapper | undefined,
  loansDetailsMapper: LoanDetailsMapper | undefined,
  usdRatesMapper: UsdRate | undefined
) {
  let formattedTvl = '-'
  let sum = 0
  if (
    collateralDatasMapper &&
    loansDetailsMapper &&
    usdRatesMapper &&
    Object.keys(collateralDatasMapper).length > 0 &&
    Object.keys(loansDetailsMapper).length > 0 &&
    Object.keys(usdRatesMapper).length > 0
  ) {
    Object.keys(collateralDatasMapper).forEach((key) => {
      const collateralData = collateralDatasMapper[key]

      if (collateralData) {
        const { totalCollateral, totalStablecoin } = loansDetailsMapper[key]
        const usdRate = usdRatesMapper[collateralData.llamma.collateral]

        if (usdRate === 'NaN') {
          formattedTvl = '?'
        } else {
          const totalCollateralUsd = +(totalCollateral ?? '0') * +(usdRate ?? '0')
          const totalCollateralValue = totalCollateralUsd + +(totalStablecoin ?? '0')
          sum += totalCollateralValue
        }
      }
    })

    if (+sum > 0) {
      formattedTvl = formatNumber(sum, { currency: 'USD', showDecimalIfSmallNumberOnly: true })
    }
  }
  return formattedTvl
}

export default Header
