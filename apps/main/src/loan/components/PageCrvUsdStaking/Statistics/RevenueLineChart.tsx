import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import { RevenueChartTooltip } from '@/loan/components/PageCrvUsdStaking/Statistics/RevenueChartTooltip'
import type { YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusd-yield'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@ui/utils'
import { EChartsLineChart, type LineSeriesConfig } from '@ui-kit/shared/ui/Chart/EChartsLineChart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type Props = { data: ScrvUsdYieldWithAverages[]; height: number; visibleSeries?: YieldKeys[] }

export const RevenueLineChart = ({ data, height, visibleSeries }: Props) => {
  const {
    design: { Color },
  } = useTheme()

  const series: LineSeriesConfig<YieldKeys>[] = [
    {
      key: 'apyProjected',
      label: priceLineLabels.apyProjected.label,
      color: Color.Primary[500],
      dash: priceLineLabels.apyProjected.dash,
    },
    {
      key: 'proj_apy_7d_avg',
      label: priceLineLabels.proj_apy_7d_avg.label,
      color: Color.Secondary[500],
      dash: priceLineLabels.proj_apy_7d_avg.dash,
    },
    {
      key: 'proj_apy_total_avg',
      label: priceLineLabels.proj_apy_total_avg.label,
      color: Color.Tertiary[400],
      dash: priceLineLabels.proj_apy_total_avg.dash,
    },
  ]

  return (
    <Box paddingInline={Spacing.md}>
      <EChartsLineChart<ScrvUsdYieldWithAverages, YieldKeys, 'timestamp'>
        data={data}
        height={height}
        xKey="timestamp"
        series={series}
        visibleSeries={visibleSeries}
        xTickFormatter={value => formatDate(new Date(value))}
        yTickFormatter={value => formatNumber(+value, { unit: 'percentage', abbreviate: false, decimals: 1 })}
        renderTooltip={({ datum, visibleSeries }) => (
          <RevenueChartTooltip datum={datum} visibleSeries={visibleSeries} />
        )}
      />
    </Box>
  )
}
