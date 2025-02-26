import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, ROUTE } from '@/dex/constants'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@ui/utils'
import { useNetworkFromUrl, useRestPartialPathname } from '@/dex/utils/utilsRouter'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import useStore from '@/dex/store/useStore'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId, Networks } from '@/dex/types/main.types'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const QuickSwap = () => t`Quickswap`
export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const { wallet } = useWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const chainId = useStore((state) => state.curve?.chainId)
  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  const { data: tvlTotal } = useAppStatsTvl({ chainId })
  const { data: volumeTotal } = useAppStatsVolume({ chainId })

  const { rChainId, rNetwork } = useNetworkFromUrl()
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
            routerPathname,
            rNetwork,
          ),
        [hasRouter, network, networks, rChainId, rNetwork, routerCached, routerPathname],
      )}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              navigate(`/${network}/${restPartialPathname}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, networks, navigate, restPartialPathname, updateConnectState],
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
                value: formatNumber(volumeTotal?.totalVolume, { currency: 'USD', notation: 'compact' }),
              },
              { label: t`Crypto Volume Share`, value: formatNumber(volumeTotal?.cryptoShare, FORMAT_OPTIONS.PERCENT) },
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
