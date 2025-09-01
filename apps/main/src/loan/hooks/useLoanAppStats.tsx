import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import useStore from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'

const hasKeys = <K extends keyof any, V>(obj: Record<K, V> | undefined | null): obj is Record<K, V> =>
  !!obj && Object.keys(obj).length > 0

function useTvl(chainId: ChainId | undefined) {
  const collateralDatasMapper = useStore((state) => chainId && state.collaterals.collateralDatasMapper[chainId])
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)

  const collateralTokenAddresses = useMemo(
    () =>
      Object.values(collateralDatasMapper || {})
        .map((data) => data?.llamma?.collateral)
        .filter(Boolean) as string[],
    [collateralDatasMapper],
  )

  const { data: usdRates } = useTokenUsdRates({ chainId, tokenAddresses: collateralTokenAddresses })

  return useMemo(() => {
    if (!hasKeys(collateralDatasMapper) || !hasKeys(loansDetailsMapper) || Object.keys(usdRates).length === 0) {
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
      const totalCollateralUsd = +(totalCollateral ?? '0') * usdRates[collateralData.llamma.collateral]
      sum += totalCollateralUsd + +(totalStablecoin ?? '0')
    }
    return sum > 0 ? formatNumber(sum, { currency: 'USD', notation: 'compact' }) : '-'
  }, [collateralDatasMapper, loansDetailsMapper, usdRates])
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
