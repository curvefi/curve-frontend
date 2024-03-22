import type { AppLogoProps } from '@/ui/Brand/AppLogo'
import type { AppPage } from '@/ui/AppNav/types'

import React, { useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, CRVUSD_ADDRESS, CURVE_FI_ROUTE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getLocaleFromUrl, getNetworkFromUrl, getPath, getRestFullPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { formatNumber, isLoading } from '@/ui/utils'
import { useConnectWallet } from '@/onboard'
import networks, { visibleNetworksList } from '@/networks'
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

  const { rChainId, rNetwork, rNetworkIdx } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const crvusdTotalSupply = useStore((state) => state.crvusdTotalSupply)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
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

  const network = networks[rChainId]?.id
  const appLogoProps: AppLogoProps = {
    appName: 'Crvusd',
    pathname: CURVE_FI_ROUTE.MAIN,
    internalPathname: `${rLocale?.rLocalePathname}/${network}${ROUTE.PAGE_MARKETS}`,
  }

  const p: AppPage[] = [
    { route: ROUTE.PAGE_MARKETS, label: t`Markets` },
    { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
    { ...APP_LINK.main, isDivider: true },
    APP_LINK.lend,
  ]

  const pages = p.map(({ route, ...rest }) => {
    const parsedRoute = route.startsWith('http') ? route : `#${rLocale.rLocalePathname}/${rNetwork}${route}`
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
      connectState={connectState}
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
                <AppLogo {...appLogoProps} />
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
