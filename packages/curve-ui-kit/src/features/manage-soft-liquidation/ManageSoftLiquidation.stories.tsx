import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import type { Address } from '@ui-kit/utils'
import type { TokenOption } from '../select-token'
import { ManageSoftLiquidation, type Props, type ImproveHealthProps, type ClosePositionProps } from './'

const actionInfos = {
  health: { new: 69, old: 42.123 },
  loan: {
    borrowRate: { old: 0.02, new: 0.02 },
    debt: { symbol: 'crvUSD', amount: 3700000, new: 0 },
    ltv: { old: 45.23, new: 24.15 },
    collateral: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  collateral: {
    borrowed: { symbol: 'wETH', amount: 300.69 },
    leverage: { old: 9.0, new: 10.1 },
    assetsToWithdraw: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  transaction: {
    estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
  },
}

type Token = TokenOption & { balance: number }

const debtToken: Token = {
  symbol: 'crvUSD',
  address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as Address,
  balance: 321.01,
}

const collateralToRecover = [
  {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address,
    balance: 26539422,
    usd: 638000,
  },
  {
    symbol: 'crvUSD',
    address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as Address,
    balance: 12450,
    usd: 12450,
  },
]

type ImproveHealthStatus = ImproveHealthProps['status']
type ClosePositionStatus = ClosePositionProps['status']

const ManageSoftLiquidationWithState = (props: Props) => {
  const [improveHealthStatus, setImproveHealthStatus] = useState<ImproveHealthStatus>('idle')
  const [withdrawStatus, setWithdrawStatus] = useState<ClosePositionStatus>('idle')

  const mockExecution = (status: ImproveHealthStatus | ClosePositionStatus, type: 'improve-health' | 'close') => {
    const setState = type === 'improve-health' ? setImproveHealthStatus : setWithdrawStatus

    setState(status as any)
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
          mockExecution('close', 'close')
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
      collateralToRecover,
      status: 'idle' as const,
      onClose: fn(),
    },
  },
}

export default meta
