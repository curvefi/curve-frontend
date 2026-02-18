import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { HealthBar } from './'

// Helper component to show both versions
const HealthBarStory = ({
  health,
  softLiquidation,
}: {
  health: number | null | undefined
  softLiquidation: boolean | null | undefined
}) => (
  <Box sx={{ minWidth: 400, padding: 2 }}>
    <Stack spacing={4}>
      <HealthBar health={health} softLiquidation={softLiquidation} />
      <HealthBar health={health} softLiquidation={softLiquidation} small />
    </Stack>
  </Box>
)

const meta: Meta<typeof HealthBarStory> = {
  title: 'UI Kit/Widgets/HealthBar',
  component: HealthBarStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'HealthBar component displays the health status of a market position with visual indicators for liquidation risk levels. ' +
          'Available in two sizes: large (with labels) and small (compact for tables).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    health: {
      control: { type: 'range', min: -30, max: 130, step: 1 },
      description: 'Health percentage of the position (0-100). Lower values indicate higher liquidation risk.',
    },
    softLiquidation: {
      control: { type: 'boolean' },
      description:
        'Indicates if the position has soft liquidation enabled. When true, the health bar border changes to orange to signify partial protection against liquidation.',
      defaultValue: false,
    },
  },
}

export default meta
type Story = StoryObj<typeof HealthBarStory>

export const Default: Story = {
  args: { health: 75, softLiquidation: false },
  parameters: { docs: { description: { story: 'Default health bar showing a healthy position at 75%.' } } },
}

export const Pristine: Story = {
  args: { health: 100, softLiquidation: false },
  parameters: { docs: { description: { story: 'Position at pristine health (100%) - safest possible state.' } } },
}

export const Good: Story = {
  args: { health: 60, softLiquidation: false },
  parameters: { docs: { description: { story: 'Position in good health (60%) - comfortable safety margin.' } } },
}

export const Moderate: Story = {
  args: { health: 35, softLiquidation: false },
  parameters: { docs: { description: { story: 'Position at moderate health (35%) - should be monitored.' } } },
}

export const Risky: Story = {
  args: { health: 12, softLiquidation: true },
  parameters: { docs: { description: { story: 'Position at risky health (12%) - approaching danger zone.' } } },
}

export const Critical: Story = {
  args: { health: 4, softLiquidation: true },
  parameters: { docs: { description: { story: 'Position at critical health (4%) - very close to liquidation.' } } },
}

export const NearLiquidation: Story = {
  args: { health: 1, softLiquidation: true },
  parameters: { docs: { description: { story: 'Position extremely close to liquidation (1%) - action required.' } } },
}

export const Liquidated: Story = {
  args: { health: 0, softLiquidation: true },
  parameters: { docs: { description: { story: 'Position has been liquidated (0% health).' } } },
}

export const NoData: Story = {
  args: { health: null, softLiquidation: null },
  parameters: { docs: { description: { story: 'Health bar when data is not available (null/undefined)' } } },
}

export const UndefinedHealth: Story = {
  args: { health: undefined, softLiquidation: null },
  parameters: { docs: { description: { story: 'Health bar with undefined health value. Displays empty bar at 0%.' } } },
}

export const OutOfBoundsHigh: Story = {
  args: { health: 150, softLiquidation: false },
  parameters: { docs: { description: { story: 'Health bar with value exceeding 100%.' } } },
}

export const OutOfBoundsLow: Story = {
  args: { health: -20, softLiquidation: true },
  parameters: { docs: { description: { story: 'Health bar with negative value.' } } },
}
