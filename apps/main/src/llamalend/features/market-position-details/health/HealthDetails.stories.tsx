import type { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { QueryData } from '@ui-kit/lib/queries/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { decimalDiv, decimalSum, ZERO } from '@ui-kit/utils'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces
const DISCOUNT_GAP: Decimal = '3'

type HealthDetailsStoryProps = {
  health?: Decimal | null
  liquidationBuffer?: Decimal | null
  isLoading?: boolean
}

const getHealthQuery = ({ health, liquidationBuffer, isLoading }: HealthDetailsStoryProps) =>
  q<QueryData<typeof useUserHealthValues>>({
    data: maybes([health, liquidationBuffer], (h, lb) => ({
      health: h,
      healthFactor: decimalSum('1', decimalDiv(h, '100')),
      liquidationBuffer: lb,
      debug: {
        healthFull: decimalSum(h, lb),
        healthNotFull: lb,
        loanDiscount: DISCOUNT_GAP,
        liquidationDiscount: ZERO,
        discountGap: DISCOUNT_GAP,
        healthDelta: h,
      },
    })),
    isLoading: isLoading ?? false,
    error: null,
  })

const HealthDetailsStory = (props: HealthDetailsStoryProps) => <HealthDetails healthQuery={getHealthQuery(props)} />

const meta: Meta<typeof HealthDetailsStory> = {
  title: 'Llamalend/HealthDetails',
  component: HealthDetailsStory,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Health details with controlled Health and Liquidation Buffer values.',
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
type Story = StoryObj<typeof HealthDetailsStory>

export const Pristine: Story = {
  args: { health: '20', liquidationBuffer: '108' },
}

export const Loading: Story = {
  args: { isLoading: true },
}

const allStates = [
  { name: 'Undefined', args: {} },
  { name: 'Pristine', args: Pristine.args },
  { name: 'Good', args: { health: '24.1', liquidationBuffer: '110' } },
  { name: 'Caution', args: { health: '7.9', liquidationBuffer: '110' } },
  { name: 'Tight', args: { health: '4.9', liquidationBuffer: '110' } },
  { name: 'Light', args: { health: '0', liquidationBuffer: '90' } },
  { name: 'AtRisk', args: { health: '0', liquidationBuffer: '22.5' } },
  { name: 'Critical', args: { health: '0', liquidationBuffer: '2.4' } },
  { name: 'HardLiquidation', args: { health: '0', liquidationBuffer: '0' } },
  { name: 'BeyondLiquidation', args: { health: '0', liquidationBuffer: '-20' } },
] as const

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthDetails key={name} healthQuery={getHealthQuery(args ?? {})} />
      ))}
    </Stack>
  ),
}
