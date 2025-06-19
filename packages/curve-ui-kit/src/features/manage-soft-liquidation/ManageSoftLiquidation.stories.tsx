import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import type { TokenOption } from '../select-token'
import { ManageSoftLiquidation, type Props, type ImproveHealthProps, type ClosePositionProps } from './'

const actionInfos = {
  health: { new: 69, old: 42.123 },
  borrowRate: { old: 0.02, new: 0.02 },
  debt: { symbol: 'crvUSD', amount: 3700000, new: 2700000 },
  collateral: [
    { symbol: 'ETH', amount: 7.52 },
    { symbol: 'crvUSD', amount: 2457 },
  ],
  ltv: { old: 45.23, new: 24.15 },
  leverage: { old: 9.0, new: 10.1 },
  borrowedCollateral: { symbol: 'wETH', amount: 300.69 },
  estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
}

type Token = TokenOption & { balance: number }

const debtToken: Token = {
  symbol: 'crvUSD',
  address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
  balance: 321.01,
}

const collateralToken: Token = {
  symbol: 'ETH',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  balance: 1337,
}

type ImproveHealthStatus = ImproveHealthProps['status']
type ClosePositionStatus = ClosePositionProps['status']

const ManageSoftLiquidationWithState = (props: Props) => {
  const [improveHealthStatus, setImproveHealthStatus] = useState<ImproveHealthStatus>('idle')
  const [withdrawStatus, setWithdrawStatus] = useState<ClosePositionStatus>('idle')

  const mockExecution = (status: ImproveHealthStatus | ClosePositionStatus, type: 'improve-health' | 'withdraw') => {
    const setState = type === 'improve-health' ? setImproveHealthStatus : setWithdrawStatus

    setState(status)
    setTimeout(() => setState('idle'), 3000)
  }

  return (
    <ManageSoftLiquidation
      {...props}
      improveHealth={{
        ...props.improveHealth,
        status: improveHealthStatus,
        onRepay: (...args) => {
          props.improveHealth.onRepay(...args)
          mockExecution('repay', 'improve-health')
        },
        onApproveLimited: (...args) => {
          props.improveHealth.onApproveLimited(...args)
          mockExecution('approve-limited', 'improve-health')
        },
        onApproveInfinite: (...args) => {
          props.improveHealth.onApproveInfinite(...args)
          mockExecution('approve-infinite', 'improve-health')
        },
      }}
      closePosition={{
        ...props.closePosition,
        status: withdrawStatus,
        onClose: (...args) => {
          props.closePosition.onClose(...args)
          mockExecution('repay', 'withdraw')
        },
        onApproveLimited: (...args) => {
          props.closePosition.onApproveLimited(...args)
          mockExecution('approve-limited', 'withdraw')
        },
        onApproveInfinite: (...args) => {
          props.closePosition.onApproveInfinite(...args)
          mockExecution('approve-infinite', 'withdraw')
        },
      }}
    />
  )
}
const meta: Meta<typeof ManageSoftLiquidation> = {
  title: 'UI Kit/Features/ManageSoftLiquidation',
  component: ManageSoftLiquidation,
}

type Story = StoryObj<typeof ManageSoftLiquidation>

export const Default: Story = {
  render: (args) => <ManageSoftLiquidationWithState {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'ManageSoftLiquidation component allows users to handle soft liquidation positions',
        story: 'Default view showing the soft liquidation management interface',
      },
    },
  },
  args: {
    actionInfos,
    improveHealth: {
      debtToken,
      status: 'idle' as const,
      onDebtBalance: fn(),
      onRepay: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
    closePosition: {
      debtToken,
      collateralToken,
      status: 'idle' as const,
      onClose: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
  },
}

export default meta
