import Box from '@mui/material/Box'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ, q, type Range } from '@ui-kit/types/util'
import {
  SmallLiquidationRangeChart as SmallLiquidationRangeChartComponent,
  type SmallLiquidationRangeChartProps as SmallLiquidationRangeChartComponentProps,
} from './SmallLiquidationRangeChart'

const { Spacing } = SizesAndSpaces

const emptyPrices = constQ<Range<Decimal> | null>(null)
const emptyPrevPrices = q<Range<Decimal>>({ data: undefined, isLoading: false, error: null })
const loadingPrices = q<Range<Decimal> | null>({ data: undefined, isLoading: true, error: null })
const loadingPrevPrices = q<Range<Decimal>>({ data: undefined, isLoading: true, error: null })
const loadingOraclePrice = q<Decimal | null>({ data: undefined, isLoading: true, error: null })

const newOnlyRange: Range<Decimal> = ['1550', '1875']
const currentOnlyRange: Range<Decimal> = ['1525', '1900']
const currentRange: Range<Decimal> = ['1425', '1900']
const newRange: Range<Decimal> = ['1525', '1900']
const narrowNearOracleRange: Range<Decimal> = ['0.985', '0.99']
const farOracleRange: Range<Decimal> = ['1843.92', '2139.32']

const args = ({
  prices = emptyPrices,
  prevPrices = emptyPrevPrices,
  oraclePrice = constQ<Decimal | null>(null),
  isFullRepay,
}: Partial<SmallLiquidationRangeChartComponentProps> = {}): SmallLiquidationRangeChartComponentProps => ({
  prices,
  prevPrices,
  oraclePrice,
  isFullRepay,
})

const meta: Meta<typeof SmallLiquidationRangeChartComponent> = {
  title: 'Llamalend/Widgets/SmallLiquidationRangeChart',
  component: SmallLiquidationRangeChartComponent,
  decorators: [
    Story => (
      <Box
        padding={Spacing.sm}
        sx={{
          width: '100%',
          backgroundColor: t => t.design.Layer[1].Fill,
        }}
      >
        <Story />
      </Box>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'MUI and ECharts liquidation range chart for Llamalend action forms. Displays current and proposed liquidation bands plus oracle price marker.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    prices: { control: false },
    prevPrices: { control: false },
    oraclePrice: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof SmallLiquidationRangeChartComponent>

export const HealthyPosition: Story = {
  args: args({ prices: constQ(newOnlyRange), oraclePrice: constQ('1950') }),
  parameters: {
    docs: {
      description: {
        story: 'Healthy position: oracle price sits above the liquidation range.',
      },
    },
  },
}

export const NewRangeOnly: Story = {
  args: args({ prices: constQ(newOnlyRange), oraclePrice: constQ('1950') }),
  parameters: {
    docs: {
      description: {
        story: 'Shows the proposed liquidation range for a position that has not been opened yet.',
      },
    },
  },
}

export const CurrentRangeOnly: Story = {
  args: args({ prevPrices: constQ(currentOnlyRange), oraclePrice: constQ('1975') }),
  parameters: {
    docs: {
      description: {
        story: 'Shows the existing liquidation range when there is no pending range change.',
      },
    },
  },
}

export const CurrentAndNewRange: Story = {
  args: args({ prices: constQ(newRange), prevPrices: constQ(currentRange), oraclePrice: constQ('1975') }),
  parameters: {
    docs: {
      description: {
        story:
          'Shows an existing liquidation range with a proposed update inset on top, so both ranges remain visible.',
      },
    },
  },
}

export const NarrowRangeNearOracle: Story = {
  args: args({ prices: constQ(narrowNearOracleRange), oraclePrice: constQ('1') }),
  parameters: {
    docs: {
      description: {
        story: 'Narrow liquidation range near the oracle price remains visible with proportional padding.',
      },
    },
  },
}

export const FarAboveOracleBreak: Story = {
  args: args({ prevPrices: constQ(farOracleRange), oraclePrice: constQ('98436.1') }),
  parameters: {
    docs: {
      description: {
        story: 'Distant oracle price is kept visible on a compact split rail without compressing the range.',
      },
    },
  },
}

export const FarBelowOracleBreak: Story = {
  args: args({ prevPrices: constQ(farOracleRange), oraclePrice: constQ('42') }),
  parameters: {
    docs: {
      description: {
        story: 'Distant oracle price below the range is kept visible on a compact split rail.',
      },
    },
  },
}

export const EmptyState: Story = {
  args: args(),
  parameters: {
    docs: {
      description: {
        story: 'Fallback state with no liquidation range and no oracle value.',
      },
    },
  },
}

export const Loading: Story = {
  args: args({ prices: loadingPrices, prevPrices: loadingPrevPrices, oraclePrice: loadingOraclePrice }),
  parameters: {
    docs: {
      description: {
        story: 'Padded inset skeleton shown while liquidation range and oracle data are initially loading.',
      },
    },
  },
}
