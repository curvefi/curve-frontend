import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { StatisticsChart, YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield'
import useStore from '@/loan/store/useStore'
import { Stack, Card, CardHeader, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { ChartFooter } from '@ui-kit/shared/ui/ChartFooter'
import ChartHeader, { ChartSelections } from '@ui-kit/shared/ui/ChartHeader'
import type { LegendItem } from '@ui-kit/shared/ui/LegendSet'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import AdvancedDetails from './AdvancedDetails'
import DistributionsBarChart from './DistributionsBarChart'
import RevenueLineChart from './RevenueLineChart'
import StatsStack from './StatsStack'

const { Spacing, MaxWidth } = SizesAndSpaces

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartSelections: ChartSelections<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

const timeOptions: TimeOption[] = ['1M', '6M', '1Y']

type StatisticsProps = {
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  hideExpandChart: boolean
}

const Statistics = ({ isChartExpanded, toggleChartExpanded, hideExpandChart }: StatisticsProps) => {
  const selectedStatisticsChart = useStore((state) => state.scrvusd.selectedStatisticsChart)
  const setSelectedStatisticsChart = useStore((state) => state.scrvusd.setSelectedStatisticsChart)
  const revenueChartTimeOption = useStore((state) => state.scrvusd.revenueChartTimeOption)
  const setRevenueChartTimeOption = useStore((state) => state.scrvusd.setRevenueChartTimeOption)

  const { data: yieldData } = useScrvUsdYield({ timeOption: revenueChartTimeOption })
  const { data: revenueData } = useScrvUsdRevenue({})

  const smallBreakPoint = '35.9375rem' // 575px
  const smallView = useMediaQuery(`(max-width: ${smallBreakPoint})`)

  const {
    design: { Color },
  } = useTheme()

  const priceLineColors = {
    apyProjected: Color.Primary[500],
    proj_apy_7d_avg: Color.Secondary[500],
    proj_apy_total_avg: Color.Tertiary[400],
  } as const satisfies Record<YieldKeys, string>

  const legendSets: LegendItem[] = Object.entries(priceLineLabels).map(([key, { label, dash }]) => ({
    label,
    line: {
      lineStroke: priceLineColors[key as YieldKeys],
      dash,
    },
  }))

  return (
    <Stack
      width="100%"
      sx={{
        maxWidth: isChartExpanded
          ? `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`
          : MaxWidth.section,
      }}
    >
      <Card elevation={0}>
        <CardHeader title="Statistics" />
        <Box sx={{ padding: Spacing.md, marginBottom: smallView ? Spacing.xl : 0 }}>
          <StatsStack />
        </Box>
        <ChartHeader
          chartSelections={{
            selections: chartSelections,
            activeSelection: selectedStatisticsChart,
            setActiveSelection: setSelectedStatisticsChart,
          }}
          chartOptionVariant="buttons-group"
          expandChart={hideExpandChart ? undefined : { isExpanded: isChartExpanded, toggleChartExpanded }}
          sx={[{ padding: Spacing.md }]}
        />
        {selectedStatisticsChart === 'savingsRate' && (
          <Stack sx={{ marginBottom: smallView ? Spacing.xl : 0 }}>
            <RevenueLineChart data={yieldData ?? []} />
            <Box sx={{ paddingInline: Spacing.md, paddingBottom: Spacing.md }}>
              <ChartFooter
                legendSets={legendSets}
                toggleOptions={timeOptions}
                activeToggleOption={revenueChartTimeOption}
                onToggleChange={(_, newOption) => setRevenueChartTimeOption(newOption)}
              />
            </Box>
          </Stack>
        )}
        {selectedStatisticsChart === 'distributions' && <DistributionsBarChart data={revenueData ?? null} />}
      </Card>
      <AdvancedDetails />
    </Stack>
  )
}

export default Statistics
