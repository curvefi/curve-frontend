import lodash from 'lodash'
import { useMemo } from 'react'
import { useLlamaMarkets } from '@/llamalend/entities/llama-markets'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'

export function useLlamalendAppStats(enabled: boolean) {
  const address = useConnection().wallet?.account.address
  const { data } = useLlamaMarkets(address, enabled)
  const tvl = useMemo(() => lodash.sum(data?.markets?.map((market) => market.assets.collateral.balanceUsd ?? 0)), [data])
  return [
    {
      label: 'TVL',
      value: (tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, notation: 'compact' })) || '',
    },
  ]
}
