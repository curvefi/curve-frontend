import type { AppLogoProps } from '@/ui/Brand/AppLogo'

import React, { useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

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
  APPS_LINKS,
  AppNavMobile,
  AppNavBar,
  AppNavBarContent,
  AppNavMenuSection,
  AppLinkText,
  AppSelectNetwork,
} from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/Footer'
import AppLogo from '@/ui/Brand'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import DividerHorizontal from '@/ui/DividerHorizontal'
import HeaderSecondary from '@/layout/HeaderSecondary'

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
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

  const pages = () => [
    { route: ROUTE.PAGE_MARKETS, label: t`Markets` },
    { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
  ]

  const appsLinks = APPS_LINKS.filter((l) => l.id !== 'loan')

  const tvl = useMemo(
    () => _getTvl(collateralDatasMapper, loansDetailsMapper, usdRatesMapper),
    [collateralDatasMapper, loansDetailsMapper, usdRatesMapper]
  )

  // prettier-ignore
  const appStats = [
    { label: 'TVL', value: formatNumber(tvl, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
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
          appsLinks={appsLinks}
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
                {pages().map(({ route, label }) => {
                  if (!location.pathname) return null

                  return (
                    <AppLinkText
                      key={route}
                      className={location.pathname.endsWith(route) ? 'active' : ''}
                      href={`#${rLocale.rLocalePathname}/${rNetwork}${route}`}
                    >
                      {label}
                    </AppLinkText>
                  )
                })}
                <DividerHorizontal />
                <AppLinkText target="_self" href={CURVE_FI_ROUTE.CRVUSD_POOLS}>{t`crvUSD Pools`}</AppLinkText>
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
                    let pathname = getPath(params, route)
                    pathname = pathname.charAt(0) === '#' ? pathname.substring(1) : pathname
                    navigate(pathname)
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

function _getTvl(
  collateralDatasMapper: CollateralDatasMapper | undefined,
  loansDetailsMapper: LoanDetailsMapper | undefined,
  usdRatesMapper: UsdRate | undefined
) {
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
        if (
          totalCollateral &&
          totalStablecoin &&
          usdRate &&
          +totalStablecoin > 0 &&
          +totalCollateral > 0 &&
          usdRate > 0
        ) {
          const totalCollateralUsd = +totalCollateral * +usdRate
          const total = totalCollateralUsd + +totalStablecoin
          sum += total
        }
      }
    })
    return +sum > 0 ? sum : undefined
  }
}

export default Header
