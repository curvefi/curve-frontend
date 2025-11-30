import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import type { Decimal } from '@ui-kit/utils'

type Props = {
  isHighLight: boolean
  volume: Decimal | undefined
}

const TableCellVolume = ({ isHighLight, volume }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(volume, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom-end' }}
  >
    {formatNumber(volume, {
      currency: 'USD',
      notation: 'compact',
    })}
  </Chip>
)

export default TableCellVolume
