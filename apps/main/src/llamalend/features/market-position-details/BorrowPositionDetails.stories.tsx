import { MarketContext, createMarketContextValue } from '@/llamalend/features/market-context'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import {
  getMarketLiquidationBandKey,
  getMarketOraclePriceBandKey,
  getMarketOraclePriceKey,
} from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserBandsKey } from '@/llamalend/queries/user/user-bands.query'
import { getUserCurrentLeverageKey } from '@/llamalend/queries/user/user-current-leverage.query'
import { getUserDiscountsKey } from '@/llamalend/queries/user/user-discounts.query'
import { getUserHealthKey } from '@/llamalend/queries/user/user-health.query'
import { getUserPricesKey } from '@/llamalend/queries/user/user-prices.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketQuery } from '@evm-ui/lib/model'
import { getTokenUsdRateKey } from '@evm-ui/lib/model/entities/token-usd-rate'
import { TestQueryProvider } from '@evm-ui/lib/queries/test-query.provider.test'
import { MarketType } from '@evm-ui/types/market'
import { constQ, type Range } from '@evm-ui/types/util'
import { CRVUSD_ADDRESS, ReleaseChannel } from '@evm-ui/utils'
import { ZERO_ADDRESS as zeroAddress } from '@primitives/address.utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BorrowPositionDetails } from './'

const baseProps = {
  userBandsCollateralValue: 110.7,
  aboveBandsCollateralValue: 12.3,
  totalDebt: 100,
  loanDiscount: 9,
  liquidationDiscount: 6,
  userPrices: [`0.80`, `0.90`] as Range<Decimal>,
  borrow: 0,
  oraclePrice: 1,
}

const params: UserMarketQuery = { chainId: 1, marketId: 'one-way-market-7', userAddress: zeroAddress }
const userBands = [69, 118] as Range<number>
const COLLATERAL_SYMBOL = 'sUSDe'
const COLLATERAL_ADDRESS = '0x9d39a5de30e57443bff2a8307a4256c8797a3497' as Address
const BORROW_SYMBOL = 'crvUSD'
const BORROW_ADDRESS = CRVUSD_ADDRESS

const getHealthValues = ({
  aboveBandsCollateralValue,
  liquidationDiscount,
  totalDebt,
  userBandsCollateralValue,
}: Pick<
  typeof baseProps,
  'aboveBandsCollateralValue' | 'liquidationDiscount' | 'totalDebt' | 'userBandsCollateralValue'
>) => {
  const healthNotFull = ((userBandsCollateralValue * (1 - liquidationDiscount / 100)) / totalDebt - 1) * 100

  return {
    healthNotFull,
    healthFull: healthNotFull + (aboveBandsCollateralValue / totalDebt) * 100,
  }
}

const BorrowPositionDetailsStory = ({
  userBandsCollateralValue,
  aboveBandsCollateralValue,
  totalDebt,
  loanDiscount,
  liquidationDiscount,
  borrow,
  oraclePrice,
  userPrices,
}: typeof baseProps) => {
  const { healthFull, healthNotFull } = getHealthValues({
    aboveBandsCollateralValue,
    liquidationDiscount,
    totalDebt,
    userBandsCollateralValue,
  })
  const collateral = (userBandsCollateralValue + aboveBandsCollateralValue - borrow) / oraclePrice
  const oraclePriceBand =
    oraclePrice > +userPrices[1] ? userBands[0] - 3 : oraclePrice < +userPrices[0] ? userBands[1] + 1 : userBands[0]

  return (
    <MarketContext
      value={{
        ...createMarketContextValue({
          chainId: params.chainId as IChainId,
          blockchainId: 'ethereum',
          marketQuery: constQ<MarketTemplate | undefined>(undefined),
          apiMarket: constQ<LlamaMarket | undefined>(undefined),
          marketType: MarketType.Mint,
          userAddress: params.userAddress,
          api: null,
          releaseChannel: ReleaseChannel.Beta,
        }),
        marketId: params.marketId,
        tokens: {
          collateralToken: { address: COLLATERAL_ADDRESS, symbol: COLLATERAL_SYMBOL, decimals: DEFAULT_DECIMALS },
          borrowToken: { symbol: BORROW_SYMBOL, address: BORROW_ADDRESS, decimals: DEFAULT_DECIMALS },
        },
      }}
    >
      <TestQueryProvider
        data={[
          [getMarketOraclePriceBandKey(params), oraclePriceBand],
          [getUserCurrentLeverageKey(params), '1'],
          [getUserBandsKey(params), userBands],
          [getUserPricesKey(params), userPrices],
          [getUserHealthKey({ ...params, isFull: true }), `${healthFull}`],
          [getUserHealthKey({ ...params, isFull: false }), `${healthNotFull}`],
          [
            getUserDiscountsKey(params),
            { loanDiscount: `${loanDiscount}`, liquidationDiscount: `${liquidationDiscount}` },
          ],
          [getMarketOraclePriceKey(params), `${oraclePrice}`],
          [getMarketLiquidationBandKey(params), null],
          [getTokenUsdRateKey({ ...params, tokenAddress: BORROW_ADDRESS }), 1],
          [getUserStateKey(params), { collateral: `${collateral}`, stablecoin: `${borrow}`, debt: `${totalDebt}` }],
        ]}
      >
        <BorrowPositionDetails />
      </TestQueryProvider>
    </MarketContext>
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
  argTypes: {
    userBandsCollateralValue: { control: { type: 'number', min: 0, step: 0.1 } },
    aboveBandsCollateralValue: { control: { type: 'number', min: 0, step: 0.1 } },
    totalDebt: { control: { type: 'number', min: 0.1, step: 0.1 } },
    loanDiscount: { control: { type: 'number', min: 0, max: 100, step: 0.1 } },
    liquidationDiscount: { control: { type: 'number', min: 0, max: 100, step: 0.1 } },
    borrow: { control: { type: 'number', min: 0, step: 0.1 } },
    oraclePrice: { control: { type: 'number', min: 0.01, step: 0.01 } },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BorrowPositionDetailsStory>

export const Healthy: Story = {
  args: baseProps,
  parameters: {
    docs: {
      description: {
        story: 'Position above the liquidation range with a positive above-band cushion.',
      },
    },
  },
}

export const SoftLiquidation: Story = {
  args: { ...baseProps, userBandsCollateralValue: 108.5, aboveBandsCollateralValue: 0, oraclePrice: 0.85, borrow: 15 },
  parameters: {
    docs: {
      description: {
        story: 'Position in liquidation protection with collateral being converted.',
      },
    },
  },
}

export const FullyConverted: Story = {
  args: {
    ...baseProps,
    userBandsCollateralValue: 108,
    aboveBandsCollateralValue: 0,
    oraclePrice: 0.75,
    borrow: 108,
  },
  parameters: {
    docs: {
      description: {
        story: 'Collateral fully converted to crvUSD below the liquidation range.',
      },
    },
  },
}

export const IncompleteConversion: Story = {
  args: {
    ...baseProps,
    userBandsCollateralValue: 107.5,
    aboveBandsCollateralValue: 0,
    oraclePrice: 0.75,
    borrow: 100,
  },
  parameters: {
    docs: {
      description: {
        story: 'Price below the range with collateral not fully converted.',
      },
    },
  },
}

export const HardLiquidation: Story = {
  args: {
    ...baseProps,
    userBandsCollateralValue: 106.38,
    aboveBandsCollateralValue: 0,
    oraclePrice: 0.75,
    borrow: 106.38,
  },
  parameters: {
    docs: {
      description: {
        story: 'Discounted recoverable value has fallen just below debt, so full liquidation can occur.',
      },
    },
  },
}
