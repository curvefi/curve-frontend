import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { HealthAndBufferBar } from '..'

const { Spacing } = SizesAndSpaces

type HealthAndBufferBarStoryProps = {
  health: Decimal | null
  liquidationBuffer: Decimal | null
}

const HealthAndBufferBarStory = ({ health, liquidationBuffer }: HealthAndBufferBarStoryProps) => (
  <Stack sx={{ width: '100%', maxWidth: '61.5rem' }}>
    <HealthAndBufferBar health={health} liquidationBuffer={liquidationBuffer} />
  </Stack>
)

const meta: Meta<typeof HealthAndBufferBarStory> = {
  title: 'Llamalend/HealthAndBufferBar',
  component: HealthAndBufferBarStory,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Focused story for the beta Health and Liquidation Buffer metric row.',
      },
    },
  },
  argTypes: {
    health: { control: 'text' },
    liquidationBuffer: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof HealthAndBufferBarStory>

export const Pristine: Story = {
  args: { health: '426.9', liquidationBuffer: '24.1' },
}

export const Good: Story = {
  args: { health: '24.1', liquidationBuffer: '12' },
}

export const Tight: Story = {
  args: { health: '4.9', liquidationBuffer: '8' },
}

export const AtRisk: Story = {
  args: { health: '0', liquidationBuffer: '22.5' },
}

export const Critical: Story = {
  args: { health: '0', liquidationBuffer: '2.4' },
}

export const HardLiquidation: Story = {
  args: { health: '0', liquidationBuffer: '0' },
}

const allStates = [
  { name: 'Pristine', args: Pristine.args },
  { name: 'Good', args: Good.args },
  { name: 'Tight', args: Tight.args },
  { name: 'AtRisk', args: AtRisk.args },
  { name: 'Critical', args: Critical.args },
  { name: 'HardLiquidation', args: HardLiquidation.args },
] as const

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ width: '100%', maxWidth: '60rem', gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthAndBufferBar key={name} health={args?.health} liquidationBuffer={args?.liquidationBuffer} />
      ))}
    </Stack>
  ),
}
