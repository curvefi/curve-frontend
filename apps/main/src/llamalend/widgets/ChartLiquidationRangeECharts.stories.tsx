import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import {
  ChartLiquidationRange as ChartLiquidationRangeECharts,
  type ChartLiquidationRangeProps as ChartLiquidationRangeEChartsProps,
} from './ChartLiquidationRangeECharts'

const { Spacing } = SizesAndSpaces

const createLoanData: ChartLiquidationRangeEChartsProps['data'] = [
  {
    name: 'Liquidation Range',
    curr: [0, 0],
    new: [1550, 1875],
    newLabel: 'LR',
    oraclePrice: '1710.25',
    oraclePriceBand: 42,
  },
]

const manageData: ChartLiquidationRangeEChartsProps['data'] = [
  {
    name: 'Liquidation Range',
    curr: [1505, 1810],
    new: [1565, 1895],
    newLabel: 'LR',
    oraclePrice: '1702.8',
    oraclePriceBand: 43,
  },
]

const softLiquidationData: ChartLiquidationRangeEChartsProps['data'] = [
  {
    name: 'Liquidation Range',
    curr: [0, 0],
    new: [1480, 1800],
    newLabel: 'LR',
    oraclePrice: '1620.5',
    oraclePriceBand: 41,
  },
]

const emptyData: ChartLiquidationRangeEChartsProps['data'] = [
  {
    name: 'Liquidation Range',
    curr: [0, 0],
    new: [0, 0],
    newLabel: 'LR',
    oraclePrice: '',
    oraclePriceBand: 0,
  },
]

const meta: Meta<typeof ChartLiquidationRangeECharts> = {
  title: 'Llamalend/Widgets/ChartLiquidationRangeECharts',
  component: ChartLiquidationRangeECharts,
  decorators: [
    (Story) => (
      <Box
        padding={Spacing.sm}
        sx={{
          width: '100%',
          backgroundColor: (t) => t.design.Layer[1].Fill,
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
    height: { control: { type: 'number', min: 70, max: 260, step: 5 } },
    isManage: { control: 'boolean' },
    showLegend: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ChartLiquidationRangeECharts>

export const CreateLoanDetailed: Story = {
  args: {
    data: createLoanData,
    health: 75,
    softLiquidation: false,
    height: 185,
    isManage: false,
    showLegend: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Create-loan mode with only the new liquidation range visible and legend enabled.',
      },
    },
  },
}

export const ManagePosition: Story = {
  args: {
    data: manageData,
    health: 10,
    softLiquidation: false,
    height: 120,
    isManage: true,
    showLegend: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Manage-position mode showing both current and new liquidation ranges.',
      },
    },
  },
}

export const SoftLiquidationFireMarker: Story = {
  args: {
    data: softLiquidationData,
    health: 30,
    softLiquidation: true,
    height: 120,
    isManage: true,
    showLegend: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Oracle price inside the liquidation range, used to verify the chad-theme fire marker behavior.',
      },
    },
  },
}

export const EmptyState: Story = {
  args: {
    data: emptyData,
    health: 75,
    softLiquidation: false,
    height: 120,
    isManage: false,
    showLegend: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fallback state with no liquidation ranges and no oracle value.',
      },
    },
  },
}
