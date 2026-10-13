import { WagmiProvider } from 'wagmi'
import { createTestWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-test-config'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { EChartsLineChart } from './EChartsLineChart'
import { EvmChartStateWrapper } from './EvmChartStateWrapper'

const { Height, Spacing } = SizesAndSpaces
const wagmiConfig = createTestWagmiConfig()
const data = [
  { day: 1, value: 85 },
  { day: 2, value: 92 },
  { day: 3, value: 88 },
  { day: 4, value: 104 },
  { day: 5, value: 99 },
  { day: 6, value: 112 },
]

type ChartStateStoryProps = { isLoading?: boolean; isEmpty?: boolean; isError?: boolean }

const ChartStateStory = ({ isLoading = false, isEmpty = false, isError = false }: ChartStateStoryProps) => {
  const { Color } = useTheme().design

  return (
    <EvmChartStateWrapper
      height={Height.chart.sm}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={isError ? new Error('Failed to load chart data') : null}
    >
      <EChartsLineChart
        data={data}
        height={Height.chart.sm}
        xKey="day"
        xAxisType="value"
        series={[{ key: 'value', label: 'Value', color: Color.Primary[500] }]}
      />
    </EvmChartStateWrapper>
  )
}

const meta: Meta<typeof ChartStateStory> = {
  title: 'EVM UI/Shared UI/Chart State Wrapper',
  component: ChartStateStory,
  args: { isLoading: false, isEmpty: false, isError: false },
  decorators: [
    Story => (
      <WagmiProvider config={wagmiConfig}>
        <TestQueryProvider data={[]}>
          <Box
            sx={{ width: '42rem', maxWidth: '100%', padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
          >
            <Story />
          </Box>
        </TestQueryProvider>
      </WagmiProvider>
    ),
  ],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ChartStateStory>

export const WithData: Story = {}
export const Loading: Story = { args: { isLoading: true } }
export const Empty: Story = { args: { isEmpty: true } }
export const WithError: Story = { args: { isError: true } }
