import type { AppLogoProps } from '@/ui/Brand/AppLogo'
import type { ThemeType } from '@/ui/Select/SelectThemes'

import React, { useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { CONNECT_STAGE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { useConnectWallet } from '@/onboard'
import networks, { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import {
  APPS_LINKS,
  AppExternalLink,
  AppNavMobile,
  AppNavBarContent,
  AppNavBar,
  AppNavMenuSection,
  AppSelectNetwork,
} from '@/ui/AppNav'
import { CommunitySection, ResourcesSection } from '@/layout/default/Footer'
import AppLogo from '@/ui/Brand'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import DividerHorizontal from '@/ui/DividerHorizontal'
import HeaderPages from '@/layout/default/HeaderPages'
import HeaderSecondary from '@/layout/default/HeaderSecondary'

export type Page = {
  route: string
  label: string
}

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const params = useParams()
  useLayoutHeight(mainNavRef, 'mainNav')

  const connectState = useStore((state) => state.connectState)
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
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { rChainId, rNetworkIdx, rLocalePathname } = getParamsFromUrl()
  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const network = networks[rChainId]?.networkId
  const appLogoProps: AppLogoProps = {
    appName: '',
    pathname: hasRouter ? ROUTE.PAGE_SWAP : ROUTE.PAGE_POOLS,
    internalPathname: `${rLocalePathname}/${network}${hasRouter ? ROUTE.PAGE_SWAP : ROUTE.PAGE_POOLS}`,
  }

  const appsLinks = APPS_LINKS.filter((l) => l.id !== 'main')

  // prettier-ignore
  const appStats = [
    { label: t`Total Deposits`, value: formatNumber(tvlTotal ?? tvlTotalCached, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
    { label: t`Daily Volume`, value: formatNumber(volumeTotal ?? volumeTotalCached, { currency: 'USD', showDecimalIfSmallNumberOnly: true }) },
    { label: t`Crypto Volume Share`, value: formatNumber(volumeCryptoShare ?? volumeCryptoShareCached, FORMAT_OPTIONS.PERCENT) },
  ]

  const PAGES: Page[] = [
    { route: ROUTE.PAGE_SWAP, label: t`Swap` },
    { route: ROUTE.PAGE_POOLS, label: t`Pools` },
    { route: ROUTE.PAGE_CREATE_POOL, label: t`Pool Creation` },
    { route: ROUTE.PAGE_DASHBOARD, label: t`Dashboard` },
    { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
  ]

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const appNavPages = {
    pages: () => {
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
    },
    getPath,
    handleClick: (route: string) => {
      if (navigate && params) {
        let pathname = getPath(route)
        pathname = pathname.charAt(0) === '#' ? pathname.substring(1) : pathname
        navigate(pathname)
      }
    },
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
    }
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

  return (
    <>
      {isLgUp && (
        <HeaderSecondary appsLinks={appsLinks} appStats={appStats} locale={appNavLocale} theme={appNavTheme} />
      )}
      <AppNavBar ref={mainNavRef} aria-label="Main menu" isMdUp={isLgUp}>
        <AppNavBarContent pageWidth={pageWidth} className="nav-content">
          {isLgUp ? (
            <>
              <AppNavMenuSection>
                <AppLogo {...appLogoProps} />
                <HeaderPages {...appNavPages} />
                <DividerHorizontal />
                <AppExternalLink href="https://classic.curve.fi">{t`Classic UI`}</AppExternalLink>
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
              pages={appNavPages}
              sections={[
                {
                  id: 'apps',
                  title: t`Apps`,
                  links: [...appsLinks, { id: 'classic', href: 'https://classic.curve.fi', label: 'Classic UI' }],
                },
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

export default Header
