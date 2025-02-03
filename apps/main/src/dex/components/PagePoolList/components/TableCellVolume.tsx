import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import { Volume } from '@/dex/types/main.types'

type Props = {
  isHighLight: boolean
  volumeCached: { value: string } | undefined
  volume: Volume | undefined
}

const TableCellVolume = ({ isHighLight, volumeCached, volume }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(volume?.value, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom end' }}
  >
    {formatNumber(volume?.value ?? volumeCached?.value, {
      currency: 'USD',
      notation: 'compact',
    })}
  </Chip>
)

export default TableCellVolume
