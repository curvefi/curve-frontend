import { useLiquidationRangeChartData } from '@/llamalend/widgets/borrow/hooks/useLiquidationRangeChartData'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type BorrowForm, type BorrowFormQueryParams, type LlamaMarketTemplate } from '../borrow.types'
import { LoanRangeSlider } from './LoanRangeSlider'

const { Spacing } = SizesAndSpaces

const height = 85

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
  const chartData = useLiquidationRangeChartData(params, enabled)
  return (
    <Stack gap={Spacing.sm} marginBlock={Spacing.lg}>
      <LoanRangeSlider market={market} range={range} setRange={setRange} />
      <Stack>
        <Typography variant="bodyXsRegular">{t`Liquidation range`}</Typography>
        <ChartLiquidationRange
          data={chartData}
          healthColorKey="healthy"
          height={height}
          isDetailView={true}
          isManage={true}
        />
      </Stack>
    </Stack>
  )
}
