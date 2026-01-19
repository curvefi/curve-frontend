import { Tvl } from '@/dex/types/main.types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = {
  isHighLight: boolean
  tvlCached?: { value: string }
  tvl: Tvl | undefined
}

export const TableCellTvl = ({ isHighLight, tvlCached, tvl }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(tvl?.value, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom-end' }}
  >
    {formatNumber(tvl?.value ?? tvlCached?.value, { currency: 'USD', notation: 'compact' })}
  </Chip>
)
