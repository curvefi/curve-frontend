import { getHealthThresholds, type PositionHealth, type PositionStatus } from '@/llamalend/health.utils'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { MarketAssetsType } from '@primitives/llamalend/markets.constants'
import { maybes } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalDiv, decimalMultiply } from '@ui/lib/decimal'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces
const DEBT: Decimal = '10000'

type HealthDetailsStoryProps = {
  health?: Decimal
  liquidationBuffer?: Decimal
  isLiquidatable?: boolean
  status?: PositionStatus
  assetsType?: MarketAssetsType
  isLoading?: boolean
}

const HealthDetailsStory = ({
  health,
  liquidationBuffer,
  isLiquidatable = false,
  status,
  assetsType,
  isLoading,
}: HealthDetailsStoryProps) => {
  const data = maybes([health, liquidationBuffer, status], (health, liquidationBuffer, status): PositionHealth => ({
    health,
    liquidationBuffer,
    liquidationBufferAmount: decimalDiv(decimalMultiply(DEBT, liquidationBuffer), '100'),
    isLiquidatable,
    status,
  }))
  return (
    <HealthDetails
      position={isLoading ? q({ data, isLoading: true, error: null }) : constQ(data)}
      thresholds={getHealthThresholds(assetsType)}
      borrowSymbol="crvUSD"
    />
  )
}

const meta: Meta<typeof HealthDetailsStory> = {
  title: 'Llamalend/Features/HealthDetails',
  component: HealthDetailsStory,
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Health details with controlled Health and Liquidation Buffer values.' } },
  },
  argTypes: {
    health: { control: 'text' },
    liquidationBuffer: { control: 'text' },
    isLiquidatable: { control: 'boolean' },
    status: { control: 'select', options: ['aboveRange', 'nearRange', 'inRange', 'belowRange', 'liquidatable'] },
    assetsType: { control: 'select', options: Object.values(MarketAssetsType) },
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof HealthDetailsStory>

export const AboveRange: Story = { args: { health: '1.6', liquidationBuffer: '18', status: 'aboveRange' } }

export const Loading: Story = { args: { isLoading: true } }

const allStates = [
  { name: 'Undefined', args: {} },
  { name: 'AboveRange', args: AboveRange.args },
  { name: 'NearRange', args: { health: '1.08', liquidationBuffer: '12', status: 'nearRange' } },
  { name: 'JustAboveRange', args: { health: '1.00001', liquidationBuffer: '12', status: 'nearRange' } },
  { name: 'InRange', args: { health: '1', liquidationBuffer: '6', status: 'inRange' } },
  { name: 'InRangeCritical', args: { health: '1', liquidationBuffer: '2.4', status: 'inRange' } },
  { name: 'BelowRange', args: { health: '1', liquidationBuffer: '8', status: 'belowRange' } },
  {
    name: 'Liquidatable',
    args: { health: '1', liquidationBuffer: '-0.5', isLiquidatable: true, status: 'liquidatable' },
  },
  {
    name: 'CorrelatedCriticalBuffer',
    args: { health: '1.11', liquidationBuffer: '0.38', status: 'aboveRange', assetsType: MarketAssetsType.Correlated },
  },
] as const satisfies { name: string; args: HealthDetailsStoryProps }[]

export const AllStates: Story = {
  render: () => (
    <Stack sx={{ gap: Spacing.sm }}>
      {allStates.map(({ name, args }) => (
        <HealthDetailsStory key={name} {...args} />
      ))}
    </Stack>
  ),
}
