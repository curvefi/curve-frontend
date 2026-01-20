import { Volume } from '@/dex/types/main.types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Props = {
  isHighLight: boolean
  volumeCached?: { value: string }
  volume: Volume | undefined
}

export const TableCellVolume = ({ isHighLight, volumeCached, volume }: Props) => (
  <Chip
    isBold={isHighLight}
    size="md"
    tooltip={formatNumber(volume?.value, FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom-end' }}
  >
    {formatNumber(volume?.value ?? volumeCached?.value, {
      currency: 'USD',
      notation: 'compact',
    })}
  </Chip>
)
