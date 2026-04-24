import { sum } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import { fetchJson } from '@primitives/fetch.utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useMatchRoute } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { queryFactory } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { type AppName, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain, CRVUSD_ADDRESS, decimal, formatNumber, formatUsd } from '@ui-kit/utils'

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

/**
 * Gets the total supply of crvUSD from the Curve Finance API.
 * It includes the full supply, including YB mints, and is more reliable than on-chain data.
 */
const { useQuery: useCrvUsdTotalSupply } = queryFactory({
  queryKey: () => ['getCrvusdTotalSupplyNumber'] as const,
  queryFn: async () => {
    const resp = await fetch('https://api.curve.finance/api/getCrvusdTotalSupplyNumber')
    return decimal(await resp.text()) ?? null
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
  const isMarketPage = useMatchRoute({ to: `${currentApp}/$network${LLAMALEND_ROUTES.PAGE_MARKETS}/$id` })
  const showDeprecatedMarkets = useUserProfileStore((state) => state.showDeprecatedMarkets)

  enabled &&= !isDesktop || !isMarketPage // hide header stats on lend/crvusd market pages only on desktop

  const { data: marketData } = useLlamaMarkets(
    { userAddress: address, enableLLv2: useLLv2(), showDeprecatedMarkets },
    enabled,
  )
  const tvl = useMemo(() => sum((marketData?.markets ?? []).map((m) => m.tvl)), [marketData])

  const { data: dailyVolume } = useAppStatsDailyVolume({}, enabled && !!chainId)
  const { data: crvusdPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: CRVUSD_ADDRESS }, enabled)
  const { data: crvusdTotalSupply } = useCrvUsdTotalSupply({ chainId }, enabled)

  return enabled
    ? [
        {
          label: 'TVL',
          value: (tvl && formatUsd(tvl)) || '-',
        },
        {
          label: t`Daily volume`,
          value: (dailyVolume && formatUsd(dailyVolume)) || '-',
        },
        {
          label: t`Total crvUSD Supply`,
          value: (crvusdTotalSupply && formatUsd(crvusdTotalSupply)) || '-',
        },
        {
          label: 'crvUSD',
          value: (crvusdPrice && formatNumber(crvusdPrice, { unit: 'dollar', decimals: 5, abbreviate: false })) || '-',
        },
      ]
    : []
}
