import { OhlcChart } from '@evm-ui/features/candle-chart/OhlcChart'
import Stack from '@mui/material/Stack'
import { TIME_OPTIONS } from '@ui/features/charts/chart.utils'
import { ChartHeader } from '@ui/features/charts/ChartHeader'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useOhlcChart } from './hooks/useOhlcChart'

const { Spacing } = SizesAndSpaces

export const ChartTab = ({
  chart: { isLoading, setSelectedChart, setTimeOption, ohlcChartProps, flipChart },
}: {
  chart: ReturnType<typeof useOhlcChart>
}) => (
  <Stack sx={{ gap: Spacing.md, padding: Spacing.sm }}>
    <ChartHeader
      flipChart={flipChart}
      chartOptionVariant="select"
      chartSelections={{
        selections: ohlcChartProps.selectChartList,
        activeSelection: ohlcChartProps.selectedChartKey,
        setActiveSelection: setSelectedChart,
      }}
      timeOption={{ options: TIME_OPTIONS, activeOption: ohlcChartProps.timeOption, setActiveOption: setTimeOption }}
      isLoading={isLoading}
    />
    <OhlcChart {...ohlcChartProps} />
  </Stack>
)
