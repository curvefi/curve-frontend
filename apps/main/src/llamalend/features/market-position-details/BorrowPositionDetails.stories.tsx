import { zeroAddress } from 'viem'
import {
  getMarketLiquidationBandKey,
  getMarketOraclePriceBandKey,
  getMarketOraclePriceKey,
} from '@/llamalend/queries/market'
import { getUserBandsKey } from '@/llamalend/queries/user/user-bands.query'
import { getUserCurrentLeverageKey } from '@/llamalend/queries/user/user-current-leverage.query'
import { getUserHealthKey } from '@/llamalend/queries/user/user-health.query'
import { getUserPricesKey } from '@/llamalend/queries/user/user-prices.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClientProvider } from '@tanstack/react-query'
import { getTokenUsdRateKey } from '@ui-kit/lib/model/entities/token-usd-rate'
import { useFakeMarket, useTestQueryClient } from '@ui-kit/lib/queries/query.test-util'
import type { Range } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { BorrowPositionDetails } from './'

const baseProps = {
  chainId: 1,
  marketId: 'one-way-market-7',
  healthNotFull: 1.56,
  healthFull: 96,
  userPrices: [`0.47`, `0.69`] as Range<Decimal>,
  leverage: 1,
  totalDebt: 1,
  collateral: 1.8,
  collateralSymbol: 'sUSDe',
  collateralUsdPrice: 0.999,
  collateralAddress: '0x9d39a5de30e57443bff2a8307a4256c8797a3497' as Address,
  borrow: 0,
  borrowSymbol: 'crvUSD',
  borrowUsdPrice: 1,
  borrowAddress: CRVUSD_ADDRESS,
  userAddress: zeroAddress,
  marketLiquidationBand: null as number | null,
  oraclePrice: -5,
  userBands: [69, 118] as Range<number>,
}

const BorrowPositionDetailsStory = ({
  healthNotFull,
  healthFull,
  collateral,
  collateralSymbol,
  collateralAddress,
  collateralUsdPrice,
  borrow,
  borrowSymbol,
  borrowUsdPrice,
  borrowAddress,
  oraclePrice,
  userPrices,
  userBands,
  totalDebt,
  marketLiquidationBand,
  leverage,
  marketId,
  userAddress,
  chainId,
}: typeof baseProps) => {
  const params = { chainId, marketId, userAddress }
  const client = useTestQueryClient(
    [getMarketOraclePriceBandKey(params), oraclePrice],
    [getUserCurrentLeverageKey(params), `${leverage}`],
    [getUserBandsKey(params), userBands],
    [getUserPricesKey(params), userPrices],
    [getUserHealthKey({ ...params, isFull: true }), `${healthFull}`],
    [getUserHealthKey({ ...params, isFull: false }), `${healthNotFull}`],
    [getMarketOraclePriceKey(params), `${oraclePrice}`],
    [getMarketLiquidationBandKey(params), marketLiquidationBand],
    [getTokenUsdRateKey({ chainId, tokenAddress: collateralAddress }), collateralUsdPrice],
    [getTokenUsdRateKey({ chainId, tokenAddress: borrowAddress }), borrowUsdPrice],
    [getUserStateKey(params), { collateral: `${collateral}`, stablecoin: `${borrow}`, debt: `${totalDebt}` }],
  )
  const market = useFakeMarket({ collateralAddress, collateralSymbol, borrowSymbol, borrowAddress })
  return (
    <QueryClientProvider client={client}>
      <BorrowPositionDetails market={market} params={params} />
    </QueryClientProvider>
  )
}

const meta: Meta<typeof BorrowPositionDetailsStory> = {
  title: 'Llamalend/BorrowPositionDetails',
  component: BorrowPositionDetailsStory,
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
type Story = StoryObj<typeof BorrowPositionDetailsStory>

export const Healthy: Story = {
  args: baseProps,
  parameters: {
    docs: { description: { story: 'Healthy position with high health. No alert banner is shown.' } },
  },
}

export const SoftLiquidation: Story = {
  args: { ...baseProps, healthFull: 30, borrow: 1.5 },
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
  args: { ...baseProps, healthFull: 0, borrow: 1.8, collateral: 0, userBands: [-10, -6] },
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
  args: { ...baseProps, healthFull: 3, borrow: 1.5, collateral: 0.3, userBands: [-10, -6] },
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
  args: { ...baseProps, healthFull: 0, healthNotFull: -2, collateral: 0, borrow: 1 },
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
