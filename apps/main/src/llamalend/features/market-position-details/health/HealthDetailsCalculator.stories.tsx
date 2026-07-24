import { BigNumber } from 'bignumber.js'
import type { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { QueryData } from '@ui-kit/lib/queries/types'
import { q } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { HealthDetails } from './HealthDetails'

type PositionInputs = {
  userBandsCollateralValue: number
  aboveBandsCollateralValue: number
  debt: number
  loanDiscount: number
  extraHealth: number
  liquidationDiscount: number
}

const calculateHealthData = ({
  userBandsCollateralValue,
  aboveBandsCollateralValue,
  debt,
  loanDiscount,
  extraHealth,
  liquidationDiscount,
}: PositionInputs): QueryData<typeof useUserHealthValues> | undefined => {
  const values = {
    userBandsCollateralValue: new BigNumber(userBandsCollateralValue),
    aboveBandsCollateralValue: new BigNumber(aboveBandsCollateralValue),
    debt: new BigNumber(debt),
    loanDiscount: new BigNumber(loanDiscount),
    extraHealth: new BigNumber(extraHealth),
    liquidationDiscount: new BigNumber(liquidationDiscount),
  }

  if (Object.values(values).some(value => !value.isFinite()) || !values.debt.isGreaterThan(0)) return undefined

  const healthNotFull = values.userBandsCollateralValue
    .multipliedBy(new BigNumber(1).minus(values.liquidationDiscount.dividedBy(100)))
    .dividedBy(values.debt)
    .minus(1)
    .multipliedBy(100)
  const healthFull = healthNotFull.plus(values.aboveBandsCollateralValue.dividedBy(values.debt).multipliedBy(100))
  const healthDelta = healthFull.minus(healthNotFull)
  const health = BigNumber.max(healthDelta, 0)
  const effectiveLoanDiscount = values.loanDiscount.plus(values.extraHealth)
  const discountGap = effectiveLoanDiscount.minus(values.liquidationDiscount)

  return {
    health: decimal(health)!,
    healthFactor: decimal(health.dividedBy(100).plus(1))!,
    liquidationBuffer: discountGap.isGreaterThan(0)
      ? decimal(healthNotFull.dividedBy(discountGap).multipliedBy(100))
      : undefined,
    debug: {
      healthFull: decimal(healthFull)!,
      healthNotFull: decimal(healthNotFull)!,
      healthDelta: decimal(healthDelta)!,
      loanDiscount: decimal(effectiveLoanDiscount)!,
      liquidationDiscount: decimal(values.liquidationDiscount)!,
      discountGap: decimal(discountGap)!,
    },
  }
}

const PositionCalculator = (inputs: PositionInputs) => (
  <HealthDetails
    healthQuery={q({
      data: calculateHealthData(inputs),
      isLoading: false,
      error: null,
    })}
  />
)

const meta: Meta<typeof PositionCalculator> = {
  title: 'Llamalend/HealthDetails/Position Calculator',
  component: PositionCalculator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Calculate Health and Liquidation Buffer from position values. Collateral values and debt use borrowed-token units; discounts use percentages.',
      },
    },
  },
  argTypes: {
    userBandsCollateralValue: { control: { type: 'number', min: 0, step: 1 } },
    aboveBandsCollateralValue: { control: { type: 'number', min: 0, step: 1 } },
    debt: { control: { type: 'number', min: 0, step: 1 } },
    loanDiscount: { control: { type: 'number', min: 0, max: 100, step: 0.1 } },
    liquidationDiscount: { control: { type: 'number', min: 0, max: 100, step: 0.1 } },
    extraHealth: { control: { type: 'number', min: 0, max: 100, step: 0.1 } },
  },
}

export default meta
type Story = StoryObj<typeof PositionCalculator>

export const Playground: Story = {
  args: {
    userBandsCollateralValue: 110,
    aboveBandsCollateralValue: 20,
    debt: 100,
    loanDiscount: 9,
    liquidationDiscount: 6,
    extraHealth: 0,
  },
}
