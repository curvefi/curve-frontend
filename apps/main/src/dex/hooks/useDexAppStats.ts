import { useMemo } from 'react'
import { ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import type { SwapFormValuesCache } from '@/dex/store/createCacheSlice'
import { useStore } from '@/dex/store/useStore'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { APP_LINK } from '@evm-ui/shared/routes'
import { formatNumber } from '@evm-ui/utils'
import { type NetworkDef } from '@legacy-ui/utils'
import { Chain } from '@primitives/network.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { useNetworkByChain } from '../entities/networks'

export const useDexAppStats = ({ chainId }: NetworkDef, enabled: boolean) => {
  const { data: tvlTotal } = useAppStatsTvl({ chainId }, enabled)
  const { data: volumeTotal } = useAppStatsVolume({ chainId }, enabled)
  return notFalsyArray(
    enabled && [
      {
        label: t`Total Deposits`,
        value: formatNumber(tvlTotal, 'usd.notional'),
      },
      ...notFalsyArray(
        !isLiteChain(chainId) && [
          // only show total deposits on curve-lite networks
          {
            label: t`Daily Volume`,
            value: formatNumber(volumeTotal?.totalVolume, 'usd.notional'),
          },
          {
            label: t`Crypto Volume Share`,
            value: formatNumber(volumeTotal?.cryptoShare, 'percent.value'),
          },
        ],
      ),
    ],
  )
}

const [swapRoute, ...dexRoutes] = APP_LINK.dex.routes

/** For whatever reason, some chains might not be supported on the swap page */
const HIDE_ROUTER_SWAP = [Chain.Mantle]

export function useDexRoutes({ chainId }: NetworkDef) {
  const routerCached = useStore(state => state.storeCache.routerFormValues[chainId])
  const { data: network } = useNetworkByChain({ chainId })
  return useMemo(
    () => [
      ...(HIDE_ROUTER_SWAP.includes(chainId)
        ? []
        : routerCached && network
          ? [
              {
                app: 'dex' as const,
                route: _createSwapPath(network.swap, routerCached),
                label: () => t`Swap`,
              },
            ]
          : [swapRoute]),
      ...dexRoutes.filter(page => page.route !== ROUTE.PAGE_SWAP),
    ],
    [chainId, network, routerCached],
  )
}

function _createSwapPath(routerDefault: Record<string, string>, routerCached: SwapFormValuesCache) {
  const from = routerCached?.fromAddress ?? routerDefault?.fromAddress
  const to = routerCached?.toAddress ?? routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}
