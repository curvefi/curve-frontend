import type { Meta, StoryObj } from '@storybook/react-vite'
import { BorrowPositionDetails, type BorrowPositionDetailsProps } from './'

const baseProps: BorrowPositionDetailsProps = {
  liquidationAlert: { softLiquidation: false, hardLiquidation: false, status: 'healthy' },
  health: { value: 75, loading: false },
  liquidationRange: { value: [1800, 2200], rangeToLiquidation: 15, loading: false },
  bandRange: { value: [10, 15], loading: false },
  leverage: { value: 1, loading: false },
  collateralValue: {
    totalValue: 5000,
    collateral: { value: 1.5, usdRate: 3200, symbol: 'WETH' },
    borrow: { value: 200, usdRate: 1, symbol: 'crvUSD' },
    loading: false,
  },
  totalDebt: { value: 3000, loading: false },
}

const meta: Meta<typeof BorrowPositionDetails> = {
  title: 'Llamalend/BorrowPositionDetails',
  component: BorrowPositionDetails,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composite component showing a borrow position: liquidation alert banner, health metric with bar, ' +
          'and key position metrics (collateral value, liquidation threshold, total debt, leverage). ' +
          'Each UserPositionStatus triggers a different alert and health bar state.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BorrowPositionDetails>

export const Healthy: Story = {
  args: { ...baseProps },
  parameters: {
    docs: { description: { story: 'Healthy position with high health. No alert banner is shown.' } },
  },
}

export const SoftLiquidation: Story = {
  args: {
    ...baseProps,
    liquidationAlert: { softLiquidation: true, hardLiquidation: false, status: 'softLiquidation' },
    health: { value: 30, loading: false },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Position in soft liquidation — collateral is being converted. ' +
          'Warning alert: "Liquidation protection active". Health bar shows "Liquidation protection" label.',
      },
    },
  },
}

export const FullyConverted: Story = {
  args: {
    ...baseProps,
    liquidationAlert: { softLiquidation: false, hardLiquidation: false, status: 'fullyConverted' },
    health: { value: 12, loading: false },
    collateralValue: {
      totalValue: 3100,
      collateral: { value: 0, usdRate: 3200, symbol: 'WETH' },
      borrow: { value: 3100, usdRate: 1, symbol: 'crvUSD' },
      loading: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Collateral fully converted to borrowed token. ' +
          'Warning alert: "Fully converted to crvUSD". Collateral value shows 0 WETH.',
      },
    },
  },
}

export const IncompleteConversion: Story = {
  args: {
    ...baseProps,
    liquidationAlert: { softLiquidation: false, hardLiquidation: false, status: 'incompleteConversion' },
    health: { value: 5, loading: false },
    collateralValue: {
      totalValue: 2800,
      collateral: { value: 0.3, usdRate: 3200, symbol: 'WETH' },
      borrow: { value: 1840, usdRate: 1, symbol: 'crvUSD' },
      loading: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Price below range but collateral not fully converted — position is undercollateralized. ' +
          'Error alert: "Position at risk — incomplete conversion".',
      },
    },
  },
}

export const HardLiquidation: Story = {
  args: {
    ...baseProps,
    liquidationAlert: { softLiquidation: false, hardLiquidation: true, status: 'hardLiquidation' },
    health: { value: -2, loading: false },
    liquidationRange: { value: [1800, 2200], rangeToLiquidation: -5, loading: false },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Health has reached 0 — position can be liquidated at any time. ' +
          'Error alert: "Position can be hard-liquidated". Health bar is fully red.',
      },
    },
  },
}
