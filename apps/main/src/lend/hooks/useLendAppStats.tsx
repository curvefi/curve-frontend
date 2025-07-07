import { useTvl } from '@/lend/entities/chain'
import { ChainId } from '@/lend/types/lend.types'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

export function useLendAppStats(chainId: ChainId | undefined) {
  const { data: tvl } = useTvl(chainId)
  return [
    {
      label: 'TVL',
      value: (tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, notation: 'compact' })) || '',
    },
  ]
}
