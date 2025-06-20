import { useMemo } from 'react'
import { ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import type { SwapFormValuesCache } from '@/dex/store/createCacheSlice'
import useStore from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { FORMAT_OPTIONS, formatNumber, type NetworkDef } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'

export const useDexAppStats = (network: NetworkDef | undefined) => {
  const { curveApi = {} } = useConnection()
  const { data: tvlTotal } = useAppStatsTvl(curveApi)
  const { data: volumeTotal } = useAppStatsVolume(curveApi)
  return [
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
  ]
}

export function useDexRoutes(rChainId: ChainId) {
  const hasRouter = useStore((state) => state.getNetworkConfigFromApi(rChainId).hasRouter)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])
  const networks = useStore((state) => state.networks.networks)
  const network = networks[rChainId]
  return useMemo(
    () => [
      ...(hasRouter && routerCached && (!network || network.showRouterSwap)
        ? [
            {
              app: 'dex' as const,
              route: _createSwapPath(network.swap, routerCached),
              label: () => t`Quickswap`,
            },
          ]
        : []),
      ...APP_LINK.dex.routes.filter((page) => page.route !== ROUTE.PAGE_SWAP),
    ],
    [hasRouter, network, routerCached],
  )
}

function _createSwapPath(routerDefault: Record<string, string>, routerCached: SwapFormValuesCache) {
  const from = routerCached?.fromAddress ?? routerDefault?.fromAddress
  const to = routerCached?.toAddress ?? routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}
