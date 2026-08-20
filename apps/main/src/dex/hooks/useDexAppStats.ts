import { useMemo } from 'react'
import { ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import type { SwapFormValuesCache } from '@/dex/store/createCacheSlice'
import { useStore } from '@/dex/store/useStore'
import { type NetworkDef } from '@legacy-ui/utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { t } from '@evm-ui/lib/i18n'
import { APP_LINK } from '@evm-ui/shared/routes'
import { formatNumber } from '@evm-ui/utils'
import { useNetworkByChain } from '../entities/networks'

export const useDexAppStats = ({ isLite, chainId }: NetworkDef, enabled: boolean) => {
  const { data: tvlTotal } = useAppStatsTvl({ chainId }, enabled)
  const { data: volumeTotal } = useAppStatsVolume({ chainId }, enabled)
  return notFalsyArray(
    enabled && [
      {
        label: t`Total Deposits`,
        value: formatNumber(tvlTotal, 'usd.notional'),
      },
      ...notFalsyArray(
        !isLite && [
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

export function useDexRoutes({ chainId, showRouterSwap }: NetworkDef) {
  const routerCached = useStore(state => state.storeCache.routerFormValues[chainId])
  const { data: network } = useNetworkByChain({ chainId })
  return useMemo(
    () => [
      ...(showRouterSwap
        ? routerCached && network
          ? [
              {
                app: 'dex' as const,
                route: _createSwapPath(network.swap, routerCached),
                label: () => t`Swap`,
              },
            ]
          : [swapRoute]
        : []),
      ...dexRoutes.filter(page => page.route !== ROUTE.PAGE_SWAP),
    ],
    [showRouterSwap, network, routerCached],
  )
}

function _createSwapPath(routerDefault: Record<string, string>, routerCached: SwapFormValuesCache) {
  const from = routerCached?.fromAddress ?? routerDefault?.fromAddress
  const to = routerCached?.toAddress ?? routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}
