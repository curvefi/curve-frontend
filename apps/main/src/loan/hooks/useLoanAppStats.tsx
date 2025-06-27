import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import useStore from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const hasKeys = <K extends keyof any, V>(obj: Record<K, V> | undefined | null): obj is Record<K, V> =>
  !!obj && Object.keys(obj).length > 0

function useTvl(chainId: ChainId | undefined) {
  const collateralDatasMapper = useStore((state) => chainId && state.collaterals.collateralDatasMapper[chainId])
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  return useMemo(() => {
    if (!hasKeys(collateralDatasMapper) || !hasKeys(loansDetailsMapper) || !hasKeys(usdRatesMapper)) {
      return '-'
    }
    let sum = 0
    for (const key in collateralDatasMapper) {
      const collateralData = collateralDatasMapper[key]
      const loanDetails = loansDetailsMapper[key]
      if (!collateralData || !loanDetails) {
        continue
      }

      const { totalCollateral, totalStablecoin } = loanDetails
      const usdRate = usdRatesMapper[collateralData.llamma.collateral]
      if (usdRate === 'NaN') {
        return '?'
      }
      const totalCollateralUsd = +(totalCollateral ?? '0') * +(usdRate ?? '0')
      sum += totalCollateralUsd + +(totalStablecoin ?? '0')
    }
    return sum > 0 ? formatNumber(sum, { currency: 'USD', notation: 'compact' }) : '-'
  }, [collateralDatasMapper, loansDetailsMapper, usdRatesMapper])
}

export function useLoanAppStats(chainId: ChainId | undefined) {
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
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
    { label: 'crvUSD', value: formatNumber(crvusdPrice) || '' },
  ]
}
