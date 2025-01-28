import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import { Tvl } from '@/dex/types/main.types'

type Props = {
  isHighLight: boolean
  tvlCached: { value: string } | undefined
  tvl: Tvl | undefined
}

const TableCellTvl = ({ isHighLight, tvlCached, tvl }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(tvl?.value, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom end' }}
  >
    {formatNumber(tvl?.value ?? tvlCached?.value, { currency: 'USD', notation: 'compact' })}
  </Chip>
)

export default TableCellTvl
