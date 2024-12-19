import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, ROUTE } from '@/constants'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { useParamsFromUrl, useRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import useStore from '@/store/useStore'
import { Header as NewHeader } from '@/common/widgets/Header'
import { NavigationSection } from '@/common/widgets/Header/types'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import { APP_LINK } from '@ui-kit/shared/routes'

type HeaderProps = { sections: NavigationSection[] }

const QuickSwap = () => t`Quickswap`
export const Header = ({ sections }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const locale = useStore((state) => state.locale)
  const tvlTotal = useStore((state) => state.pools.tvlTotal)
  const volumeTotal = useStore((state) => state.pools.volumeTotal)
  const volumeCryptoShare = useStore((state) => state.pools.volumeCryptoShare)
  const themeType = useStore((state) => state.themeType)
  const setThemeType = useStore((state) => state.setThemeType)
  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const routerProps = useStore((state) => state.routerProps)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)

  const { rChainId, rNetwork, rLocalePathname } = useParamsFromUrl()
  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const { params: routerParams, location } = routerProps ?? {}
  const network = networks[rChainId]
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network
  const restPartialPathname = useRestPartialPathname()

  const theme = themeType == 'default' ? 'light' : (themeType as ThemeKey)
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
        [hasRouter, network, networks, rChainId, rLocalePathname, routerCached, routerNetwork, routerPathname],
      )}
      themes={[
        theme,
        useCallback(
          (selectedThemeType: ThemeKey) => setThemeType(selectedThemeType == 'light' ? 'default' : selectedThemeType),
          [setThemeType],
        ),
      ]}
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
