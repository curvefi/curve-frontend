import type { useUserHealthValue } from '@/llamalend/queries/user/user-health.query'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { QueryData } from '@ui-kit/lib/queries/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { ZERO } from '@ui-kit/utils'
import { HealthAndBufferBar } from '..'

const { Spacing } = SizesAndSpaces

type HealthAndBufferBarStoryProps = {
  health?: Decimal | null
  liquidationBuffer?: Decimal | null
  isLoading?: boolean
}

type HealthData = QueryData<typeof useUserHealthValue>

const getHealthQuery = ({ health, liquidationBuffer, isLoading }: HealthAndBufferBarStoryProps) =>
  q<HealthData>({
    data: maybes([health, liquidationBuffer], ([h, lb]) => ({ legacyHealth: ZERO, health: h, liquidationBuffer: lb })),
    isLoading: isLoading ?? false,
    error: null,
  })

const HealthAndBufferBarStory = (props: HealthAndBufferBarStoryProps) => (
  <Stack sx={{ width: '100%', maxWidth: '61.5rem' }}>
    <HealthAndBufferBar healthQuery={getHealthQuery(props)} />
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
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof HealthAndBufferBarStory>

export const Pristine: Story = {
  args: { health: '426.9', liquidationBuffer: '24.1' },
}

export const Loading: Story = {
  args: { health: undefined, liquidationBuffer: undefined, isLoading: true },
}

const allStates = [
  { name: 'Undefined', args: { health: undefined, liquidationBuffer: undefined } },
  { name: 'Pristine', args: Pristine.args },
  { name: 'Good', args: { health: '24.1', liquidationBuffer: '12' } },
  { name: 'Tight', args: { health: '4.9', liquidationBuffer: '8' } },
  { name: 'AtRisk', args: { health: '0', liquidationBuffer: '22.5' } },
  { name: 'Critical', args: { health: '0', liquidationBuffer: '2.4' } },
  { name: 'HardLiquidation', args: { health: '0', liquidationBuffer: '0' } },
] as const

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ width: '100%', maxWidth: '60rem', gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthAndBufferBar key={name} healthQuery={getHealthQuery(args ?? {})} />
      ))}
    </Stack>
  ),
}
