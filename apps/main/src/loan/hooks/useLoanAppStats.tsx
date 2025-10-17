import { useTokenUsdPrice } from '@/llamalend/entities/usd-prices'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import { useCrvUsdTvl } from '@/loan/entities/tvl'
import networks from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const hasKeys = <K extends keyof any, V>(obj: Record<K, V> | undefined | null): obj is Record<K, V> =>
  !!obj && Object.keys(obj).length > 0

export function useLoanAppStats(chainId: ChainId | undefined) {
  const blockchainId = chainId && networks[chainId].id
  const { data: tvl } = useCrvUsdTvl({ blockchainId })
  const { data: crvusdPrice } = useTokenUsdPrice({ blockchainId, contractAddress: CRVUSD_ADDRESS })
  const { data: dailyVolume } = useAppStatsDailyVolume({}, !!chainId)
  const { data: crvusdTotalSupply } = useAppStatsTotalCrvusdSupply({ chainId })
  return [
    {
      label: 'TVL',
      value: formatNumber(tvl, { currency: 'USD', notation: 'compact' }),
    },
    {
      label: t`Daily volume`,
      value: formatNumber(dailyVolume, { currency: 'USD', notation: 'compact' }),
    },
    {
      label: t`Total Supply`,
      value: formatNumber(crvusdTotalSupply, { currency: 'USD', notation: 'compact' }),
    },
    { label: 'crvUSD', value: formatNumber(crvusdPrice, { currency: 'USD', decimals: 5 }) },
  ]
}
