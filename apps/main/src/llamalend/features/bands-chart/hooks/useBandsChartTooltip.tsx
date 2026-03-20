import { BandsChartToken, ChartDataPoint } from '@/llamalend/features/bands-chart/types'
import { useTheme } from '@mui/material'
import { useEChartsTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsTooltip'
import { TooltipContent } from '../TooltipContent'

export const useBandsChartTooltip = (
  chartData: ChartDataPoint[],
  collateralToken: BandsChartToken,
  borrowToken: BandsChartToken,
) => {
  const theme = useTheme()
  return useEChartsTooltip(chartData, theme, (data) => (
    <TooltipContent data={data} collateralToken={collateralToken} borrowToken={borrowToken} />
  ))
}
