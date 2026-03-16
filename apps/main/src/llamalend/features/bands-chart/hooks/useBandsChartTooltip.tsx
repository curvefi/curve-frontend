import { BandsChartToken, ChartDataPoint } from '@/llamalend/features/bands-chart/types'
import { useTheme } from '@mui/material'
import { useEChartsReactTooltip } from '@ui-kit/shared/ui/Chart/hooks/useEChartsReactTooltip'
import { TooltipContent } from '../TooltipContent'

export const useBandsChartTooltip = (
  chartData: ChartDataPoint[],
  collateralToken: BandsChartToken,
  borrowToken: BandsChartToken,
) => {
  const theme = useTheme()
  return useEChartsReactTooltip(chartData, theme, (data) => (
    <TooltipContent data={data} collateralToken={collateralToken} borrowToken={borrowToken} />
  ))
}
