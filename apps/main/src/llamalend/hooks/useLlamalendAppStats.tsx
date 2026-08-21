import { sum } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import { useUserProfileStore } from '@evm-ui/features/user-profile'
import { useMatchRoute } from '@evm-ui/hooks/router'
import { useIsDesktop } from '@evm-ui/hooks/useBreakpoints'
import { EmptyValidationSuite } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { queryFactory } from '@evm-ui/lib/model'
import { type AppName, LLAMALEND_ROUTES } from '@evm-ui/shared/routes'
import { formatNumber } from '@evm-ui/utils'
import { fetchJson } from '@primitives/fetch.utils'

/** Query for getting the daily volume of all crvUSD AMMs */
const { useQuery: useAppStatsDailyVolume } = queryFactory({
  queryKey: () => ['appStatsDailyVolume'] as const,
  queryFn: async () => {
    const resp = await fetchJson<{ data: { totalVolume: number } }>(
      'https://api.curve.finance/api/getVolumes/ethereum/crvusd-amms',
    )
    return resp.data.totalVolume
  },
  category: 'llamalend.appStats',
  validationSuite: EmptyValidationSuite,
})

export function useLlamalendAppStats(
  {
    chainId,
    currentApp,
  }: {
    chainId: number | undefined
    currentApp: AppName
  },
  enabled: boolean,
) {
  const { address } = useConnection()
  const isDesktop = useIsDesktop()
  const isMarketPage = useMatchRoute({
    to: `${currentApp}/$network${LLAMALEND_ROUTES.PAGE_MARKETS}/$id`,
    fuzzy: true, // match this route and any routes nested beneath it
  })
  const enableDeprecatedMarkets = useUserProfileStore(state => state.showDeprecatedMarkets)

  enabled &&= !isDesktop || !isMarketPage // hide header stats on lend/crvusd market pages only on desktop

  const { data: marketData } = useLlamaMarkets({ userAddress: address, enableDeprecatedMarkets }, enabled)
  const tvl = useMemo(() => sum((marketData?.markets ?? []).map(m => m.tvl)), [marketData])

  const { data: dailyVolume } = useAppStatsDailyVolume({}, enabled && !!chainId)

  return enabled
    ? [
        {
          label: 'TVL',
          value: (tvl && formatNumber(tvl, 'usd.notional')) || '-',
        },
        {
          label: t`Daily volume`,
          value: (dailyVolume && formatNumber(dailyVolume, 'usd.notional')) || '-',
        },
      ]
    : []
}
