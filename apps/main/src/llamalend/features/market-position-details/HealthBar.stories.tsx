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
          'Available in two sizes: large (with labels) and small (compact for tables). ' +
          'Health levels: Pristine (>50), Good (15-50), Risky (0-15), Liquidation protection (soft liquidation active), ' +
          'Liquidation protection disabled (health <= 0).',
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
        'When true, label becomes "Liquidation protection" and color thresholds shift: <2.5 red, <40 orange, >=40 yellow (never green). ' +
        'When false, standard thresholds apply: <2.5 red, <15 orange, <50 yellow, >=50 green.',
      defaultValue: false,
    },
  },
}

export default meta
type Story = StoryObj<typeof HealthBarStory>

// --- Health Level Stories (one per label) ---

export const Pristine: Story = {
  args: { health: 75, softLiquidation: false },
  parameters: {
    docs: { description: { story: 'Label: "Pristine" (health > 50). Green bar.' } },
  },
}

export const Good: Story = {
  args: { health: 35, softLiquidation: false },
  parameters: {
    docs: { description: { story: 'Label: "Good" (15 < health <= 50). Yellow bar.' } },
  },
}

export const Risky: Story = {
  args: { health: 10, softLiquidation: false },
  parameters: {
    docs: { description: { story: 'Label: "Risky" (0 < health <= 15). Orange bar.' } },
  },
}

export const LiquidationProtection: Story = {
  args: { health: 45, softLiquidation: true },
  parameters: {
    docs: {
      description: {
        story:
          'Label: "Liquidation protection" (softLiquidation is true). Orange bar (health < 40 threshold shifts with soft liquidation).',
      },
    },
  },
}

export const HardLiquidation: Story = {
  args: { health: 0, softLiquidation: false },
  parameters: {
    docs: {
      description: {
        story: 'Label: "Liquidation protection disabled" (health <= 0, no soft liquidation). Red bar at 100% width.',
      },
    },
  },
}

// --- Edge Case Stories ---

export const NearLiquidation: Story = {
  args: { health: 1, softLiquidation: true },
  parameters: {
    docs: {
      description: {
        story:
          'Health at 1% with soft liquidation. Red bar (< 2.5 threshold). Label: "Liquidation protection". Split-color text effect visible.',
      },
    },
  },
}

export const NoData: Story = {
  args: { health: null, softLiquidation: null },
  parameters: { docs: { description: { story: 'Health bar when data is not available (null). No label rendered.' } } },
}

export const UndefinedHealth: Story = {
  args: { health: undefined, softLiquidation: null },
  parameters: {
    docs: { description: { story: 'Health bar with undefined health value. No label rendered, empty bar.' } },
  },
}

export const OutOfBoundsHigh: Story = {
  args: { health: 150, softLiquidation: false },
  parameters: {
    docs: { description: { story: 'Health value exceeding 100%. Clamped to 100% width. Label: "Pristine".' } },
  },
}

export const OutOfBoundsLow: Story = {
  args: { health: -20, softLiquidation: true },
  parameters: {
    docs: {
      description: {
        story: 'Negative health value with soft liquidation. Clamped to 0%. Label: "Liquidation protection".',
      },
    },
  },
}
