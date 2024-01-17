import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  isHighLight: boolean
  volumeCached: Volume | undefined
  volume: Volume | undefined
}

const TableCellVolume = ({ isHighLight, volumeCached, volume }: Props) => {
  return (
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
}

export default TableCellVolume
