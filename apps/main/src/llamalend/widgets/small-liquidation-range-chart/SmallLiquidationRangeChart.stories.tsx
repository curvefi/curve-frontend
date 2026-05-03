import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import {
  SmallLiquidationRangeChart as SmallLiquidationRangeChartComponent,
  type SmallLiquidationRangeChartProps as SmallLiquidationRangeChartComponentProps,
} from './SmallLiquidationRangeChart'

const { Spacing } = SizesAndSpaces

const healthyPositionData: SmallLiquidationRangeChartComponentProps['data'] = [
  {
    new: [1550, 1875],
    newLabel: 'LR',
    oraclePrice: '1950',
  },
]

const softLiquidationData: SmallLiquidationRangeChartComponentProps['data'] = [
  {
    new: [1480, 1800],
    newLabel: 'LR',
    oraclePrice: '1620.5',
  },
]

const emptyData: SmallLiquidationRangeChartComponentProps['data'] = [
  {
    new: [0, 0],
    newLabel: 'LR',
    oraclePrice: '',
  },
]

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
          'MUI and ECharts liquidation range chart for Llamalend action forms. Displays one liquidation band plus oracle price marker.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: false },
    health: { control: { type: 'number', min: -10, max: 100, step: 1 } },
    softLiquidation: { control: 'boolean' },
    showLegend: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof SmallLiquidationRangeChartComponent>

export const HealthyPosition: Story = {
  args: {
    data: healthyPositionData,
    health: 75,
    softLiquidation: false,
    showLegend: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Healthy position: oracle price sits above the liquidation range.',
      },
    },
  },
}

export const SoftLiquidation: Story = {
  args: {
    data: softLiquidationData,
    health: 30,
    softLiquidation: true,
    showLegend: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Soft liquidation: oracle price has fallen inside the liquidation range.',
      },
    },
  },
}

export const EmptyState: Story = {
  args: {
    data: emptyData,
    health: 75,
    softLiquidation: false,
    showLegend: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fallback state with no liquidation range and no oracle value.',
      },
    },
  },
}
