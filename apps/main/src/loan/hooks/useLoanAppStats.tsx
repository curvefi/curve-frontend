import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import useStore from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'
import { formatNumber } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import { useMintMarketMapping } from '../entities/mint-markets'

const hasKeys = <K extends keyof any, V>(obj: Record<K, V> | undefined | null): obj is Record<K, V> =>
  !!obj && Object.keys(obj).length > 0

/** Todo: we should replace this entire hook with prices API some day, there should be an endpoint available */
function useTvl(chainId: ChainId | undefined) {
  const { llamaApi: api } = useConnection()

  const marketMapping = useMintMarketMapping({ chainId })
  const markets = useMemo(
    () => (api && marketMapping ? Object.values(marketMapping).map(api.getMintMarket) : []),
    [api, marketMapping],
  )
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)

  const collateralTokenAddresses = useMemo(
    () => markets.map((market) => market.collateral).filter(Boolean) as string[],
    [markets],
  )

  const { data: usdRates } = useTokenUsdRates({ chainId, tokenAddresses: collateralTokenAddresses })

  return useMemo(() => {
    if (!markets.length || !hasKeys(loansDetailsMapper) || Object.keys(usdRates).length === 0) {
      return '-'
    }
    let sum = 0
    for (const market of markets) {
      const loanDetails = loansDetailsMapper[market.id]
      if (!loanDetails) {
        continue
      }

      const { totalCollateral, totalStablecoin } = loanDetails
      const totalCollateralUsd = +(totalCollateral ?? '0') * usdRates[market.collateral]
      sum += totalCollateralUsd + +(totalStablecoin ?? '0')
    }
    return sum > 0 ? formatNumber(sum, { currency: 'USD', notation: 'compact' }) : '-'
  }, [loansDetailsMapper, markets, usdRates])
}

export function useLoanAppStats(chainId: ChainId | undefined) {
  const { data: crvusdPrice } = useTokenUsdRate({ chainId, tokenAddress: CRVUSD_ADDRESS })
  const { data: dailyVolume } = useAppStatsDailyVolume({})
  const { data: crvusdTotalSupply } = useAppStatsTotalCrvusdSupply({ chainId })
  return [
    {
      label: 'TVL',
      value: useTvl(chainId),
    },
    {
      label: t`Daily volume`,
      value: formatNumber(dailyVolume, { currency: 'USD', notation: 'compact' }),
    },
    {
      label: t`Total Supply`,
      value: formatNumber(crvusdTotalSupply?.total, { currency: 'USD', notation: 'compact' }),
    },
    { label: 'crvUSD', value: formatNumber(crvusdPrice, { decimals: 5 }) || '' },
  ]
}
