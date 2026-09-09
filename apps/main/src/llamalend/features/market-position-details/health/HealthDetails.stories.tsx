import type { UserPositionStatus } from '@/llamalend/llamalend.types'
import type { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import type { QueryData } from '@evm-ui/lib/queries/types'
import { decimalDiv, decimalMultiply, decimalSum } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces
const DISCOUNT_GAP: Decimal = '3'

type HealthDetailsStoryProps = {
  health?: Decimal | null
  liquidationBuffer?: Decimal | null
  positionStatus?: UserPositionStatus
  isLoading?: boolean
}

const getHealthQuery = ({ health, liquidationBuffer, isLoading }: HealthDetailsStoryProps) => {
  const data = maybes([health, liquidationBuffer], (h, lb) => {
    const healthNotFull = decimalMultiply(decimalDiv(lb, '100'), DISCOUNT_GAP)
    return { health: h, healthFactor: decimalSum('1', decimalDiv(h, '100')), healthNotFull, liquidationBuffer: lb }
  }) satisfies QueryData<typeof useUserHealthValues> | undefined

  return isLoading ? q({ data, isLoading: true, error: null }) : constQ(data)
}

const HealthDetailsStory = (props: HealthDetailsStoryProps) => (
  <HealthDetails
    health={getHealthQuery(props)}
    positionStatus={q({ data: props.positionStatus, isLoading: !!props.isLoading, error: null })}
  />
)

const meta: Meta<typeof HealthDetailsStory> = {
  title: 'Llamalend/HealthDetails',
  component: HealthDetailsStory,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Health details with controlled Health and Liquidation Buffer values.' } },
  },
  argTypes: {
    health: { control: 'text' },
    liquidationBuffer: { control: 'text' },
    positionStatus: {
      control: 'select',
      options: ['healthy', 'softLiquidation', 'hardLiquidation', 'fullyConverted', 'incompleteConversion'],
    },
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof HealthDetailsStory>

export const Pristine: Story = { args: { health: '426.9', liquidationBuffer: '108', positionStatus: 'healthy' } }

export const Loading: Story = { args: { isLoading: true } }

const allStates = [
  { name: 'Undefined', args: {} },
  { name: 'Pristine', args: Pristine.args },
  { name: 'Good', args: { health: '24.1', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Caution', args: { health: '7.9', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Tight', args: { health: '4.9', liquidationBuffer: '110', positionStatus: 'healthy' } },
  { name: 'Light', args: { health: '0', liquidationBuffer: '90', positionStatus: 'fullyConverted' } },
  { name: 'AtRisk', args: { health: '0', liquidationBuffer: '22.5', positionStatus: 'softLiquidation' } },
  { name: 'Critical', args: { health: '0', liquidationBuffer: '2.4', positionStatus: 'incompleteConversion' } },
  { name: 'HardLiquidation', args: { health: '0', liquidationBuffer: '0', positionStatus: 'hardLiquidation' } },
  { name: 'BeyondLiquidation', args: { health: '0', liquidationBuffer: '-20', positionStatus: 'hardLiquidation' } },
] as const

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthDetailsStory key={name} {...args} />
      ))}
    </Stack>
  ),
}
