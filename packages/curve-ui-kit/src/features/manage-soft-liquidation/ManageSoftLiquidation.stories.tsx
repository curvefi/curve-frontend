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

const debtTokens: Token[] = [
  {
    symbol: 'crvUSD',
    address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    balance: 321.01,
  },
]

const collateralTokens: Token[] = [
  {
    symbol: 'ETH',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    balance: 1337,
  },
  {
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    balance: 0.5,
  },
  {
    symbol: 'USDC',
    address: '0xA0b86a33E6417aFf13d68399C5D6d693C006c5aF',
    balance: 2500.75,
  },
]

type ImproveHealthStatus = ImproveHealthProps['status']
type ClosePositionStatus = ClosePositionProps['status']

const ManageSoftLiquidationWithState = (props: Props) => {
  const [withdrawDebtToken, setWithdrawDebtToken] = useState<Token>(props.closePosition.selectedDebtToken!)
  const [withdrawCollateralToken, setWithdrawCollateralToken] = useState<Token>(
    props.closePosition.selectedCollateralToken!,
  )

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
        debtToken: debtTokens[0],
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
        selectedDebtToken: withdrawDebtToken,
        selectedCollateralToken: withdrawCollateralToken,
        onDebtToken: (token) => {
          props.closePosition.onDebtToken(token)
          setWithdrawDebtToken(debtTokens.find((x) => x.address === token.address)!)
        },
        onCollateralToken: (token) => {
          props.closePosition.onCollateralToken(token)
          setWithdrawCollateralToken(collateralTokens.find((x) => x.address === token.address)!)
        },
        onRepay: (...args) => {
          props.closePosition.onRepay(...args)
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
      debtToken: debtTokens[0],
      status: 'idle' as const,
      onDebtBalance: fn(),
      onRepay: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
    closePosition: {
      debtTokens,
      collateralTokens,
      selectedDebtToken: debtTokens[0],
      selectedCollateralToken: collateralTokens[0],
      status: 'idle' as const,
      onDebtToken: fn(),
      onCollateralToken: fn(),
      onDebtBalance: fn(),
      onCollateralBalance: fn(),
      onRepay: fn(),
      onApproveLimited: fn(),
      onApproveInfinite: fn(),
    },
  },
}

export default meta
