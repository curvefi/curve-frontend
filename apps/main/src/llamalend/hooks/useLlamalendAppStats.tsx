import { sum } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import { useMintMarkets } from '@/llamalend/queries/market-list/mint-markets'
import { type AppName } from '@evm-ui/shared/routes'
import { formatNumber } from '@primitives/number.utils'
import { useUserProfileStore } from '@ui/features/user-profile/store'
import { useMatchRoute } from '@ui/hooks/router'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'

export function useLlamalendAppStats(
  { chainId, currentApp }: { chainId: number | undefined; currentApp: AppName },
  enabled: boolean,
) {
  const { address } = useConnection()
  const isDesktop = useIsDesktop()
  const isMarketPage = useMatchRoute({
    to: `${currentApp}/$network/markets/$id`,
    fuzzy: true, // match this route and any routes nested beneath it
  })
  const enableDeprecatedMarkets = useUserProfileStore(state => state.showDeprecatedMarkets)

  enabled &&= !isDesktop || !isMarketPage // hide header stats on lend/crvusd market pages only on desktop

  const { data: marketData } = useLlamaMarkets({ userAddress: address, enableDeprecatedMarkets }, enabled)
  const tvl = useMemo(() => sum((marketData?.markets ?? []).map(m => m.tvl)), [marketData])

  const { data: mintMarkets } = useMintMarkets({}, enabled && !!chainId)
  const dailyVolume = useMemo(() => sum(mintMarkets?.map(market => market.volume24hUsd)), [mintMarkets])

  return enabled
    ? [
        { label: 'TVL', value: (tvl && formatNumber(tvl, 'usd.notional')) || '-' },
        { label: t`Daily volume`, value: (dailyVolume && formatNumber(dailyVolume, 'usd.notional')) || '-' },
      ]
    : []
}
