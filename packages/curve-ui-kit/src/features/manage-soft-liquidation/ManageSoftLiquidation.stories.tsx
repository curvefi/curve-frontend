import { useState } from 'react'
import { fn } from 'storybook/test'
import { ethAddress } from 'viem'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import type { TokenOption } from '../select-token'
import { ManageSoftLiquidation, type Props, type ImproveHealthProps, type ClosePositionProps } from './'

type Token = TokenOption & { amount: number }

const debtToken: Token = {
  symbol: 'crvUSD',
  address: CRVUSD_ADDRESS,
  amount: 321.01,
}

const collateralToRecover = [
  {
    symbol: 'ETH',
    address: ethAddress,
    amount: 26539422,
    usd: 638000,
  },
  {
    symbol: 'crvUSD',
    address: CRVUSD_ADDRESS,
    amount: 12450,
    usd: 12450,
  },
]

const canClose = {
  requiredToClose: 100,
  missing: 42,
}

type ImproveHealthStatus = ImproveHealthProps['status']
type ClosePositionStatus = ClosePositionProps['status']

const ManageSoftLiquidationWithState = (props: Props) => {
  const [improveHealthStatus, setImproveHealthStatus] = useState<ImproveHealthStatus>('idle')
  const [withdrawStatus, setWithdrawStatus] = useState<ClosePositionStatus>('idle')

  const [updatingActionInfos, setUpdatingActionInfos] = useState(false)
  let actionInfosTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  const mockExecution = (status: ImproveHealthStatus | ClosePositionStatus, type: 'improve-health' | 'close') => {
    const setState = type === 'improve-health' ? setImproveHealthStatus : setWithdrawStatus

    setState(status as any)
    setTimeout(() => setState('idle'), 3000)
  }

  const mockActionInfoUpdating = () => {
    setUpdatingActionInfos(true)
    clearTimeout(actionInfosTimeout)
    actionInfosTimeout = setTimeout(() => setUpdatingActionInfos(false), 3000)
  }

  return (
    <ManageSoftLiquidation
      {...props}
      actionInfos={{ ...props.actionInfos, loading: updatingActionInfos }}
      improveHealth={{
        ...props.improveHealth,
        status: improveHealthStatus,
        onDebtBalance: (balance) => {
          props.improveHealth.onDebtBalance(balance)
          mockActionInfoUpdating()
        },
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

const actionInfos = {
  loading: false,
  health: { current: 42.123, next: 69 },
  loan: {
    borrowRate: { current: 0.02, next: 0.02 },
    debt: { symbol: 'crvUSD', amount: 3700000, next: 3 },
    ltv: { current: 45.23, next: 24.15 },
    collateral: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  collateral: {
    borrowed: { symbol: 'wETH', amount: 300.69 },
    leverage: { current: 9.0, next: 10.1 },
    assetsToWithdraw: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  transaction: {
    estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
  },
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
      userBalance: 6900,
      status: 'idle' as const,
      onDebtBalance: fn(),
      onRepay: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
    closePosition: {
      debtToken,
      collateralToRecover,
      canClose,
      status: 'idle' as const,
      onClose: fn(),
    },
  },
}

const actionInfosIdle = {
  health: { current: 6.42 },
  loan: {
    borrowRate: { current: 0.02 },
    debt: { symbol: 'crvUSD', amount: 3700000 },
    ltv: { current: 45.23 },
    collateral: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  collateral: {
    borrowed: { symbol: 'wETH', amount: 300.69 },
    leverage: { current: 9.0 },
    assetsToWithdraw: [
      { symbol: 'ETH', amount: 7.52 },
      { symbol: 'crvUSD', amount: 2457 },
    ],
  },
  transaction: {
    estimatedTxCost: { eth: 0.0024, gwei: 0.72, dollars: 0.48 },
  },
}

export const IdleActionInfos: Story = {
  render: (args) => <ManageSoftLiquidationWithState {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'ManageSoftLiquidation component allows users to handle soft liquidation positions',
        story: 'All action infos ar ein idle state',
      },
    },
  },
  args: {
    actionInfos: actionInfosIdle,
    improveHealth: {
      debtToken,
      userBalance: 6900,
      status: 'idle' as const,
      onDebtBalance: fn(),
      onRepay: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
    closePosition: {
      debtToken,
      collateralToRecover,
      canClose,
      status: 'idle' as const,
      onClose: fn(),
    },
  },
}

export default meta
