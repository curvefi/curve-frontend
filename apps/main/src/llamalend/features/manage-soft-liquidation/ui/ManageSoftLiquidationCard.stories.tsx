import { useRef, useState } from 'react'
import { fn } from 'storybook/test'
import { ethAddress } from 'viem'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CRVUSD_ADDRESS, decimal } from '@ui-kit/utils'
import { ManageSoftLiquidationCard, type Props, type ImproveHealthProps, type ClosePositionProps } from '../'

const debtToken: ImproveHealthProps['debtToken'] = {
  symbol: 'crvUSD',
  address: CRVUSD_ADDRESS,
  amount: '321.01',
}

const collateralToRecover: ClosePositionProps['collateralToRecover'] = [
  {
    symbol: 'ETH',
    address: ethAddress,
    amount: '26539422',
    usd: 638000,
  },
  {
    symbol: 'crvUSD',
    address: CRVUSD_ADDRESS,
    amount: '12450',
    usd: 12450,
  },
]

const canClose: ClosePositionProps['canClose'] = {
  missing: '42',
}

type ImproveHealthStatus = ImproveHealthProps['status']
type ClosePositionStatus = ClosePositionProps['status']

const ManageSoftLiquidationWithState = (props: Props) => {
  const [improveHealthStatus, setImproveHealthStatus] = useState<ImproveHealthStatus>('idle')
  const [withdrawStatus, setWithdrawStatus] = useState<ClosePositionStatus>('idle')

  const [updatingActionInfos, setUpdatingActionInfos] = useState(false)
  const actionInfosTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const mockExecution = async ([status, type]:
    | [ImproveHealthStatus, 'improve-health']
    | [ClosePositionStatus, 'close']) => {
    if (type === 'improve-health') {
      setImproveHealthStatus(status)
    } else {
      setWithdrawStatus(status)
    }
    setTimeout(() => setWithdrawStatus('idle'), 3000)
  }

  const mockActionInfoUpdating = () => {
    setUpdatingActionInfos(true)
    clearTimeout(actionInfosTimeout.current)
    actionInfosTimeout.current = setTimeout(() => setUpdatingActionInfos(false), 3000)
  }

  return (
    <ManageSoftLiquidationCard
      {...props}
      actionInfos={{ ...props.actionInfos, loading: updatingActionInfos }}
      improveHealth={{
        ...props.improveHealth,
        status: improveHealthStatus,
        onDebtBalance: (balance) => {
          props.improveHealth.onDebtBalance(balance)
          mockActionInfoUpdating()
        },
        onRepay: async (...args) => {
          props.improveHealth.onRepay(...args)
          await mockExecution(['repay', 'improve-health'])
          // eslint-disable-next-line react-hooks/immutability
          props.improveHealth.userBalance = decimal(+(props.improveHealth.userBalance ?? 0) - +args[0])
          if (props.improveHealth.debtToken) {
            props.improveHealth.debtToken.amount =
              decimal(+(props.improveHealth.debtToken?.amount ?? 0) - +args[0]) ?? '0'
          }
        },
        onApproveLimited: async (...args) => {
          props.improveHealth.onApproveLimited(...args)
          await mockExecution(['approve-limited', 'improve-health'])
        },
        onApproveInfinite: async (...args) => {
          props.improveHealth.onApproveInfinite(...args)
          await mockExecution(['approve-infinite', 'improve-health'])
        },
      }}
      closePosition={{
        ...props.closePosition,
        status: withdrawStatus,
        onClose: async (...args) => {
          props.closePosition.onClose(...args)
          await mockExecution(['close', 'close'])
        },
      }}
    />
  )
}

const actionInfos = {
  loading: false,
  health: { current: 42.123, next: 69 },
  loanInfo: {
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

const meta: Meta<typeof ManageSoftLiquidationCard> = {
  title: 'Llamalend/Features/ManageSoftLiquidationCard',
  component: ManageSoftLiquidationCard,
}

type Story = StoryObj<typeof ManageSoftLiquidationCard>

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
      userBalance: '690',
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
  loanInfo: {
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
      userBalance: '6900',
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
