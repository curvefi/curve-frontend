import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import {
  SmallLiquidationRangeChart as SmallLiquidationRangeChartComponent,
  type SmallLiquidationRangeChartProps as SmallLiquidationRangeChartComponentProps,
} from './SmallLiquidationRangeChart'

const { Spacing } = SizesAndSpaces

const newOnlyRanges: SmallLiquidationRangeChartComponentProps['liquidationRanges'] = {
  newRange: [1550, 1875],
}

const currentOnlyRanges: SmallLiquidationRangeChartComponentProps['liquidationRanges'] = {
  currentRange: [1525, 1900],
}

const currentAndNewRange: SmallLiquidationRangeChartComponentProps['liquidationRanges'] = {
  currentRange: [1425, 1900],
  newRange: [1525, 1900],
}

const emptyRanges: SmallLiquidationRangeChartComponentProps['liquidationRanges'] = {}

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
    liquidationRanges: { control: false },
    oraclePrice: { control: { type: 'number', min: 0, step: 1 } },
  },
}

export default meta
type Story = StoryObj<typeof SmallLiquidationRangeChartComponent>

export const HealthyPosition: Story = {
  args: {
    liquidationRanges: newOnlyRanges,
    oraclePrice: 1950,
  },
  parameters: {
    docs: {
      description: {
        story: 'Healthy position: oracle price sits above the liquidation range.',
      },
    },
  },
}

export const NewRangeOnly: Story = {
  args: {
    liquidationRanges: newOnlyRanges,
    oraclePrice: 1950,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the proposed liquidation range for a position that has not been opened yet.',
      },
    },
  },
}

export const CurrentRangeOnly: Story = {
  args: {
    liquidationRanges: currentOnlyRanges,
    oraclePrice: 1975,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the existing liquidation range when there is no pending range change.',
      },
    },
  },
}

export const CurrentAndNewRange: Story = {
  args: {
    liquidationRanges: currentAndNewRange,
    oraclePrice: 1975,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows an existing liquidation range with a proposed update inset on top, so both ranges remain visible.',
      },
    },
  },
}

export const EmptyState: Story = {
  args: {
    liquidationRanges: emptyRanges,
    oraclePrice: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fallback state with no liquidation range and no oracle value.',
      },
    },
  },
}
