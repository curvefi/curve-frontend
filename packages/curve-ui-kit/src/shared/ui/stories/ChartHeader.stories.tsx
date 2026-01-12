import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DEFAULT_TIME_OPTION, TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import ChartHeader, { ChartSelections } from '../ChartHeader'
import { ToggleBandsChartButton } from '../ToggleBandsChartButton'

type DexChartKey = 'lp-usd' | 'lp-token' | 'pair'
const dexSelections: ChartSelections<DexChartKey>[] = [
  { key: 'lp-usd', label: 'LP Token (USD)', activeTitle: 'LP Token (USD)' },
  { key: 'lp-token', label: 'LP Token (ETH)', activeTitle: 'LP Token (ETH)' },
]

type LendLoanChartKey = 'price' | 'reserves'
const lendLoanSelections: ChartSelections<LendLoanChartKey>[] = [
  { key: 'price', label: 'Price', activeTitle: 'Price (USD)' },
]

type StatisticsChart = 'savingsRate' | 'distributions'
const statisticsSelections: ChartSelections<StatisticsChart>[] = [
  { key: 'savingsRate', label: 'Savings Rate', activeTitle: 'Historical Rate' },
  { key: 'distributions', label: 'Distributions', activeTitle: 'Historical Distributions' },
]

const sharedBox = {
  width: 600,
}

type CandleChartTimeOption = (typeof TIME_OPTIONS)[number]

const DexOhlcChartHeader = () => {
  const [activeChart, setActiveChart] = useState<DexChartKey>('pair')
  const [activeTime, setActiveTime] = useState<CandleChartTimeOption>(DEFAULT_TIME_OPTION)
  const [isPairFlipped, setIsPairFlipped] = useState(false)

  const chartSelections = useMemo<ChartSelections<DexChartKey>[]>(() => {
    const pairLabel = isPairFlipped ? 'USDC / ETH' : 'ETH / USDC'
    return [...dexSelections, { key: 'pair', label: pairLabel, activeTitle: pairLabel }]
  }, [isPairFlipped])

  const flipChart = activeChart === 'pair' ? () => setIsPairFlipped((prev) => !prev) : undefined

  return (
    <Box sx={sharedBox}>
      <ChartHeader
        chartOptionVariant="select"
        chartSelections={{
          selections: chartSelections,
          activeSelection: activeChart,
          setActiveSelection: (value: DexChartKey) => setActiveChart(value),
        }}
        timeOption={{
          options: TIME_OPTIONS,
          activeOption: activeTime,
          setActiveOption: (value: CandleChartTimeOption) => setActiveTime(value),
        }}
        flipChart={flipChart}
      />
    </Box>
  )
}

const LendLoanOhlcChartHeader = () => {
  const [activeChart, setActiveChart] = useState<LendLoanChartKey>('price')
  const [activeTime, setActiveTime] = useState<CandleChartTimeOption>(DEFAULT_TIME_OPTION)
  const [isBandsVisible, setIsBandsVisible] = useState(true)

  return (
    <Box sx={sharedBox}>
      <ChartHeader
        chartOptionVariant="select"
        chartSelections={{
          selections: lendLoanSelections,
          activeSelection: activeChart,
          setActiveSelection: (value: LendLoanChartKey) => setActiveChart(value),
        }}
        timeOption={{
          options: TIME_OPTIONS,
          activeOption: activeTime,
          setActiveOption: (value: CandleChartTimeOption) => setActiveTime(value),
        }}
        customButton={
          <ToggleBandsChartButton
            label="Bands"
            isVisible={isBandsVisible}
            onClick={() => setIsBandsVisible(!isBandsVisible)}
          />
        }
      />
    </Box>
  )
}

const ScrvUsdStatisticsHeaderExample = () => {
  const [activeChart, setActiveChart] = useState<StatisticsChart>('savingsRate')
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Box sx={sharedBox}>
      <ChartHeader
        chartOptionVariant="buttons-group"
        chartSelections={{
          selections: statisticsSelections,
          activeSelection: activeChart,
          setActiveSelection: (value: StatisticsChart) => setActiveChart(value),
        }}
        expandChart={{
          isExpanded,
          toggleChartExpanded: () => setIsExpanded((prev) => !prev),
        }}
      />
    </Box>
  )
}

const meta: Meta<typeof ChartHeader> = {
  title: 'UI Kit/Widgets/ChartHeader',
  component: ChartHeader,
  parameters: {
    docs: {
      description: {
        component:
          'Component to render the chart header for the DEX OHLC, Lend/Loan OHLC and scrvUSD statistics views.',
      },
    },
  },
}

type Story = StoryObj<typeof ChartHeader>

export const DexOhlcHeader: Story = {
  render: () => <DexOhlcChartHeader />,
  parameters: {
    docs: {
      description: {
        story:
          'Matches the DEX OHLC chart header: select dropdown variant with time selector, flip control for pair label.',
      },
    },
  },
}

export const LendLoanOhlcHeader: Story = {
  render: () => <LendLoanOhlcChartHeader />,
  parameters: {
    docs: {
      description: {
        story:
          'Matches the Lend/Loan OHLC charts: select dropdown variant with time selector and the Bands toggle button as a custom button.',
      },
    },
  },
}

export const ScrvUsdStatisticsHeader: Story = {
  render: () => <ScrvUsdStatisticsHeaderExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Matches the scrvUSD statistics view: button-group variant with expand/collapse control and expand/shrink icon button.',
      },
    },
  },
}

export default meta
