import { useMemo } from 'react'
import { ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { APP_LINK } from '@evm-ui/shared/routes'
import { type NetworkDef } from '@legacy-ui/utils'
import { Chain } from '@primitives/network.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { useNetworkByChain } from '../entities/networks'

export const useDexAppStats = ({ chainId }: NetworkDef, enabled: boolean) => {
  const { data: tvlTotal } = useAppStatsTvl({ chainId }, enabled)
  const { data: volumeTotal } = useAppStatsVolume({ chainId }, enabled)
  return notFalsyArray(
    enabled && [
      { label: t`Total Deposits`, value: formatNumber(tvlTotal, 'usd.notional') },
      ...notFalsyArray(
        !isLiteChain(chainId) && [
          // only show total deposits on curve-lite networks
          { label: t`Daily Volume`, value: formatNumber(volumeTotal?.totalVolume, 'usd.notional') },
          { label: t`Crypto Volume Share`, value: formatNumber(volumeTotal?.cryptoShare, 'percent.value') },
        ],
      ),
    ],
  )
}

const [swapRoute, ...dexRoutes] = APP_LINK.dex.routes

/** For whatever reason, some chains might not be supported on the swap page */
const HIDE_ROUTER_SWAP = [Chain.Mantle]

export function useDexRoutes({ chainId }: NetworkDef) {
  const { data: network } = useNetworkByChain({ chainId })
  return useMemo(
    () => [
      ...(HIDE_ROUTER_SWAP.includes(chainId)
        ? []
        : network
          ? [{ app: 'dex' as const, route: _createSwapPath(network.swap), label: () => t`Swap` }]
          : [swapRoute]),
      ...dexRoutes.filter(page => page.route !== ROUTE.PAGE_SWAP),
    ],
    [chainId, network],
  )
}

function _createSwapPath(routerDefault: Record<string, string>) {
  const from = routerDefault?.fromAddress
  const to = routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}
