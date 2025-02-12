import { LlamaMarket } from '@/loan/entities/llama-markets'
import { CellContext } from '@tanstack/react-table'
import { LinearProgress } from '@ui-kit/shared/ui/LinearProgress'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PercentageCell = ({ getValue }: CellContext<LlamaMarket, number>) => {
  const value = getValue()
  if (value == null) {
    return '-'
  }
  return (
    <Stack gap={Spacing.xs}>
      {value.toFixed(2) + '%'}
      <LinearProgress percent={value} size="medium" />
    </Stack>
  )
}
