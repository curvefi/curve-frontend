import { zeroAddress } from 'viem'
import { MarketContext, createMarketContextValue } from '@/llamalend/features/market-context'
import { BorrowPositionDetails } from '@/llamalend/features/market-position-details'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { getMarketOraclePriceBandKey, getMarketOraclePriceKey } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserCurrentLeverageKey } from '@/llamalend/queries/user'
import { getUserBandsKey } from '@/llamalend/queries/user/user-bands.query'
import { getUserHealthKey } from '@/llamalend/queries/user/user-health.query'
import { getUserPricesKey } from '@/llamalend/queries/user/user-prices.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { getTokenUsdRateKey } from '@evm-ui/queries/token-usd-rate.query'
import { MarketType } from '@evm-ui/types/market'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, type Range } from '@ui/features/queries/util'
import { ReleaseChannel } from '@ui/lib/env'

const baseProps = {
  params: { chainId: 1, marketId: 'one-way-market-7', userAddress: zeroAddress },
  healthNotFull: 1.56 as number | null,
  healthFull: 96,
  userPrices: [`0.47`, `0.69`] as Range<Decimal> | undefined,
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
  oraclePrice: -5,
  userBands: [69, 118] as Range<number>,
}

const PositionDetailsTest = ({
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
  leverage,
  params,
}: typeof baseProps) => (
  <ComponentTestWrapper>
    <MarketContext
      value={{
        ...createMarketContextValue({
          chainId: params.chainId as IChainId,
          blockchainId: 'ethereum',
          marketQuery: constQ(undefined as MarketTemplate | undefined),
          apiMarket: constQ(undefined as LlamaMarket | undefined),
          marketType: MarketType.Mint,
          userAddress: params.userAddress,
          api: null,
          releaseChannel: ReleaseChannel.Beta,
        }),
        marketId: params.marketId,
        tokens: {
          collateralToken: { address: collateralAddress, symbol: collateralSymbol, decimals: DEFAULT_DECIMALS },
          borrowToken: { symbol: borrowSymbol, address: borrowAddress, decimals: DEFAULT_DECIMALS },
        },
      }}
    >
      <TestQueryProvider
        data={[
          [getMarketOraclePriceBandKey(params), oraclePrice],
          [getUserCurrentLeverageKey(params), `${leverage}`],
          [getUserBandsKey(params), userBands],
          [getUserPricesKey(params), userPrices],
          [getUserHealthKey({ ...params, isFull: true }), `${healthFull}`],
          [getUserHealthKey({ ...params, isFull: false }), maybe(healthNotFull, h => `${h}`) ?? null],
          [getMarketOraclePriceKey(params), `${oraclePrice}`],
          [getTokenUsdRateKey({ ...params, tokenAddress: collateralAddress }), collateralUsdPrice],
          [getTokenUsdRateKey({ ...params, tokenAddress: borrowAddress }), borrowUsdPrice],
          [getUserStateKey(params), { collateral: `${collateral}`, stablecoin: `${borrow}`, debt: `${totalDebt}` }],
        ]}
      >
        <BorrowPositionDetails />
      </TestQueryProvider>
    </MarketContext>
  </ComponentTestWrapper>
)

describe('Beta position card', () => {
  beforeEach(() => {
    cy.viewport(1280, 900)
    cy.window().then(window => window.localStorage.setItem('release-channel-v1', JSON.stringify(ReleaseChannel.Beta)))
  })

  it('renders metrics with an active position', () => {
    cy.mount(<PositionDetailsTest {...baseProps} oraclePrice={1} />)
    cy.get('[data-testid="beta-position-card"]').should('be.visible')
    cy.get('[data-testid="position-status"]').should('contain.text', 'Above range')
    cy.get('[data-testid="liquidation-range-value"]').should('contain.text', '−')
    cy.get('[data-testid="health-details-liquidation-buffer-metric-value"]').should('contain.text', 'of debt')
    cy.get('[data-testid="position-collateral-value"]').should('be.visible')
  })

  it('renders metrics while the range is loading', () => {
    cy.mount(<PositionDetailsTest {...baseProps} oraclePrice={1} userPrices={undefined} />)
    cy.get('[data-testid="beta-position-card"]').should('be.visible')
    cy.get('[data-testid="position-collateral-value"]').should('be.visible')
  })
})
