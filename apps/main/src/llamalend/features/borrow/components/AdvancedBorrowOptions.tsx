import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type BorrowForm, type BorrowFormQueryParams, type LlamaMarketTemplate } from '../borrow.types'
import { useLiquidationRangeChartData } from '../hooks/useLiquidationRangeChartData'
import { LiquidationRangeSlider } from './LiquidationRangeSlider'

const { Spacing } = SizesAndSpaces

const chartHeight = 185

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
}) => (
  <Stack gap={Spacing.sm} marginBlock={Spacing.lg}>
    <LiquidationRangeSlider market={market} range={range} setRange={setRange} />
    <Stack
      sx={{
        '--chart_reference_line--color': (t) => t.design.Color.Primary[500],
        '--health_mode_healthy_darkBg--color': (t) => t.design.Text.TextColors.Feedback.Success,
        '& .recharts-reference-line-line': { strokeDasharray: '6' },
      }}
    >
      <Typography variant="bodyXsRegular">{t`Liquidation range`}</Typography>
      <ChartLiquidationRange
        data={useLiquidationRangeChartData(params, enabled)}
        healthColorKey="healthy"
        height={chartHeight}
        isDetailView
        showLegend
      />
    </Stack>
  </Stack>
)
