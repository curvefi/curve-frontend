import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, ROUTE } from '@/constants'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { useParamsFromUrl, useRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress, useConnectWallet } from '@ui-kit/features/connect-wallet'
import useStore from '@/store/useStore'
import { Header as NewHeader, useHeaderHeight } from '@/common/widgets/Header'
import { NavigationSection } from '@/common/widgets/Header/types'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@/ui/Banner/GlobalBanner'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const QuickSwap = () => t`Quickswap`
export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const tvlTotal = useStore((state) => state.pools.tvlTotal)
  const volumeTotal = useStore((state) => state.pools.volumeTotal)
  const volumeCryptoShare = useStore((state) => state.pools.volumeCryptoShare)
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  const theme = useUserProfileStore((state) => state.theme)
  const setTheme = useUserProfileStore((state) => state.setTheme)
  const locale = useUserProfileStore((state) => state.locale)

  const { rChainId, rNetwork, rLocalePathname } = useParamsFromUrl()
  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const location = useLocation()
  const network = networks[rChainId]
  const routerPathname = location?.pathname ?? ''
  const restPartialPathname = useRestPartialPathname()

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      locale={locale}
      isMdUp={isMdUp}
      currentApp="main"
      isLite={network?.isLite}
      pages={useMemo(
        () =>
          _parseRouteAndIsActive(
            [
              ...(hasRouter && (!network || network.showRouterSwap)
                ? [
                    {
                      route: _parseSwapRoute(rChainId, ROUTE.PAGE_SWAP, routerCached, networks),
                      label: QuickSwap,
                    },
                  ]
                : []),
              ...APP_LINK.main.pages.filter((page) => page.route !== ROUTE.PAGE_SWAP),
            ],
            rLocalePathname,
            routerPathname,
            rNetwork,
          ),
        [hasRouter, network, networks, rChainId, rLocalePathname, rNetwork, routerCached, routerPathname],
      )}
      themes={[theme, setTheme]}
      ChainProps={{
        options: visibleNetworksList,
        theme,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              navigate(`${rLocalePathname}/${network}/${restPartialPathname}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, networks, navigate, rLocalePathname, restPartialPathname, updateConnectState],
        ),
      }}
      WalletProps={{
        onConnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, ['']),
          [updateConnectState],
        ),
        onDisconnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET),
          [updateConnectState],
        ),
        walletAddress: getWalletSignerAddress(wallet),
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        label: t`Connect Wallet`,
      }}
      appStats={[
        {
          label: t`Total Deposits`,
          value: formatNumber(tvlTotal, { currency: 'USD', notation: 'compact' }),
        },
        ...(network?.isLite // only show total deposits on curve-lite networks
          ? []
          : [
              {
                label: t`Daily Volume`,
                value: formatNumber(volumeTotal, { currency: 'USD', notation: 'compact' }),
              },
              { label: t`Crypto Volume Share`, value: formatNumber(volumeCryptoShare, FORMAT_OPTIONS.PERCENT) },
            ]),
      ]}
      sections={sections}
      height={useHeaderHeight(bannerHeight)}
      BannerProps={BannerProps}
    />
  )
}

function _parseSwapRoute(
  rChainId: ChainId,
  route: string,
  routerCached: { fromAddress: string; fromToken: string; toAddress: string; toToken: string } | undefined,
  networks: Networks,
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
