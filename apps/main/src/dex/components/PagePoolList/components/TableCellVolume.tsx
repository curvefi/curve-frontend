import { Volume } from '@/dex/types/main.types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = {
  isHighLight: boolean
  volume: Volume | undefined
}

const TableCellVolume = ({ isHighLight, volume }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(volume?.value, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom-end' }}
  >
    {formatNumber(volume?.value, {
      currency: 'USD',
      notation: 'compact',
    })}
  </Chip>
)

export default TableCellVolume
