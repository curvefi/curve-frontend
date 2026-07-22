import type { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { QueryData } from '@ui-kit/lib/queries/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { ZERO } from '@ui-kit/utils'
import { HealthAndBufferBar } from './HealthAndBufferBar'

const { Spacing } = SizesAndSpaces

type HealthAndBufferBarStoryProps = {
  health?: Decimal | null
  liquidationBuffer?: Decimal | null
  isLoading?: boolean
}

const getHealthQuery = ({ health, liquidationBuffer, isLoading }: HealthAndBufferBarStoryProps) =>
  q<QueryData<typeof useUserHealthValues>>({
    data: maybes([health, liquidationBuffer], (h, lb) => ({ legacyHealth: ZERO, health: h, liquidationBuffer: lb })),
    isLoading: isLoading ?? false,
    error: null,
  })

const HealthAndBufferBarStory = (props: HealthAndBufferBarStoryProps) => (
  <HealthAndBufferBar healthQuery={getHealthQuery(props)} />
)

const meta: Meta<typeof HealthAndBufferBarStory> = {
  title: 'Llamalend/HealthAndBufferBar',
  component: HealthAndBufferBarStory,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Focused story for the stacked beta Health and Liquidation Buffer bars.',
      },
    },
  },
  argTypes: {
    health: { control: 'text' },
    liquidationBuffer: { control: 'text' },
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof HealthAndBufferBarStory>

export const Pristine: Story = {
  args: { health: '426.9', liquidationBuffer: '108' },
}

export const Loading: Story = {
  args: { health: undefined, liquidationBuffer: undefined, isLoading: true },
}

const allStates = [
  { name: 'Undefined', args: { health: undefined, liquidationBuffer: undefined } },
  { name: 'Pristine', args: Pristine.args },
  { name: 'Good', args: { health: '24.1', liquidationBuffer: '12' } },
  { name: 'Caution', args: { health: '7.9', liquidationBuffer: '8' } },
  { name: 'Tight', args: { health: '4.9', liquidationBuffer: '8' } },
  { name: 'Light', args: { health: '0', liquidationBuffer: '104' } },
  { name: 'AtRisk', args: { health: '0', liquidationBuffer: '22.5' } },
  { name: 'Critical', args: { health: '0', liquidationBuffer: '2.4' } },
  { name: 'HardLiquidation', args: { health: '0', liquidationBuffer: '0' } },
  { name: 'BeyondLiquidation', args: { health: '0', liquidationBuffer: '-20' } },
  { name: 'Overfunded', args: { health: '20', liquidationBuffer: '140' } },
] as const

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthAndBufferBar key={name} healthQuery={getHealthQuery(args ?? {})} />
      ))}
    </Stack>
  ),
}
