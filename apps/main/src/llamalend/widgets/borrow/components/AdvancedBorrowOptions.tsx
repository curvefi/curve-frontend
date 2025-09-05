import { useBorrowBandsAllRanges } from '@/llamalend/widgets/borrow/queries/borrow-bands-all-ranges.query'
import { useBorrowBands } from '@/llamalend/widgets/borrow/queries/borrow-bands.query'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type BorrowForm, type BorrowFormQueryParams, type LlamaMarketTemplate } from '../borrow.types'
import { LoanRangeSlider } from './LoanRangeSlider'

const { Spacing } = SizesAndSpaces

export const AdvancedBorrowOptions = ({
  params,
  values: { range },
  setRange,
  market,
  enabled,
}: {
  params: BorrowFormQueryParams
  values: BorrowForm
  setRange: (n: number) => void
  market: LlamaMarketTemplate | undefined
  enabled: boolean
}) => {
  const { data: allBands, isLoading: allBandsLoading, error: allBandsError } = useBorrowBandsAllRanges(params, enabled)
  const { data: bands, isLoading: bandsLoading, error: bandsError } = useBorrowBands(params, enabled)
  return (
    <Stack gap={Spacing.sm}>
      <LoanRangeSlider market={market} range={range} setRange={setRange} />
    </Stack>
  )
}
