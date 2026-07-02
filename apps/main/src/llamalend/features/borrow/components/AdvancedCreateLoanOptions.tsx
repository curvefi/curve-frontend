import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { CreateLoanForm } from '../types'
import { LiquidationRangeSlider } from './LiquidationRangeSlider'

const { Spacing } = SizesAndSpaces

export const AdvancedCreateLoanOptions = ({
  values: { range },
  setRange,
  minBands,
  maxBands,
}: {
  values: CreateLoanForm
  setRange: (n: number) => void
  minBands: number | undefined
  maxBands: number | undefined
}) => (
  <Stack sx={{ marginBlock: Spacing.sm }}>
    <LiquidationRangeSlider minBands={minBands} maxBands={maxBands} range={range} setRange={setRange} />
  </Stack>
)
