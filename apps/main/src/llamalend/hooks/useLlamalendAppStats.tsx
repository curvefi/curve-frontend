import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useLlamaMarkets } from '@/llamalend/queries/market-list/llama-markets'
import { fetchJson } from '@curvefi/primitives/fetch.utils'
import { useMatchRoute } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { queryFactory } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LEND_ROUTES, type AppName } from '@ui-kit/shared/routes'
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
  validationSuite: EmptyValidationSuite,
})

const LLAMALEND_APP: AppName = 'llamalend'

export function useLlamalendAppStats(
  {
    chainId,
    currentApp,
  }: {
    chainId: number | undefined
    currentApp: AppName
  },
  enabled: boolean = true,
) {
  const { address } = useConnection()
  const isNewLendSubNav = useLendMarketSubNav()
  const isDesktop = useIsDesktop()
  const params = useMatchRoute<{ page: string }>({
    to: `$app/$network/$page`,
  })

  const shouldShowStats =
    isNewLendSubNav && isDesktop
      ? // hide header stats on lend/crvusd market pages only
        currentApp === LLAMALEND_APP || (params && `/${params.page}` !== LEND_ROUTES.PAGE_MARKETS)
      : true
  const statsEnabled = enabled && shouldShowStats

  const { data: marketData } = useLlamaMarkets(address, statsEnabled)
  const tvl = useMemo(() => (marketData?.markets ?? []).reduce((acc, market) => acc + market.tvl, 0), [marketData])

  const { data: dailyVolume } = useAppStatsDailyVolume({}, statsEnabled && !!chainId)
  const { data: crvusdPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: CRVUSD_ADDRESS }, statsEnabled)
  const { data: crvusdTotalSupply } = useCrvUsdTotalSupply({ chainId }, statsEnabled)

  if (!statsEnabled) return []

  return [
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
}
