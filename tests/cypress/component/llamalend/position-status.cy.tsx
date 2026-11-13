import { zeroAddress } from 'viem'
import { MarketContext, createMarketContextValue } from '@/llamalend/features/market-context'
import { BorrowPositionDetails } from '@/llamalend/features/market-position-details/BorrowPositionDetails'
import type { PositionStatus } from '@/llamalend/health.utils'
import { getIsUserCloseToSoftLiquidation, getLegacyLiquidationStatus } from '@/llamalend/llama.utils'
import type { MarketTemplate, UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { getMarketOraclePriceBandKey } from '@/llamalend/queries/market/market-oracle-price-band.query'
import { getMarketOraclePriceKey } from '@/llamalend/queries/market/market-oracle-price.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserBandsKey } from '@/llamalend/queries/user/user-bands.query'
import { getUserCurrentLeverageKey } from '@/llamalend/queries/user/user-current-leverage.query'
import { getUserDiscountsKey } from '@/llamalend/queries/user/user-discounts.query'
import { getUserHealthKey } from '@/llamalend/queries/user/user-health.query'
import { getLoanExistsKey } from '@/llamalend/queries/user/user-loan-exists.query'
import { getUserPricesKey } from '@/llamalend/queries/user/user-prices.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { oneViewport, openTooltip } from '@cy/support/ui'
import { getTokenUsdRateKey } from '@evm-ui/queries/token-usd-rate.query'
import { MarketType } from '@evm-ui/types/market'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, type Range } from '@ui/features/queries/util'
import { ReleaseChannel } from '@ui/lib/env'

const ALERT_TEST_ID = '[data-testid="borrow-position-status-alert"]'

const baseProps = {
  params: { chainId: 1, marketId: 'one-way-market-7', userAddress: zeroAddress },
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
          [getLoanExistsKey(params), true],
          [getUserPricesKey({ ...params, loanExists: true }), userPrices],
          [getUserHealthKey({ ...params, isFull: true }), `${healthFull}`],
          [getUserHealthKey({ ...params, isFull: false }), `${healthNotFull}`],
          [getUserDiscountsKey(params), { loanDiscount: '9', liquidationDiscount: '6' }],
          [getMarketOraclePriceKey(params), `${oraclePrice}`],
          [getTokenUsdRateKey({ ...params, tokenAddress: collateralAddress }), collateralUsdPrice],
          [getTokenUsdRateKey({ ...params, tokenAddress: borrowAddress }), borrowUsdPrice],
          [
            getUserStateKey(params),
            { collateral: `${collateral}`, convertedBorrowed: `${borrow}`, debt: `${totalDebt}` },
          ],
        ]}
      >
        <BorrowPositionDetails />
      </TestQueryProvider>
    </MarketContext>
  </ComponentTestWrapper>
)

describe('Position status logic', () => {
  describe('getIsUserCloseToSoftLiquidation', () => {
    it('uses only the distance between the user and oracle bands', () => {
      expect(getIsUserCloseToSoftLiquidation(10, 7)).to.eq(false)
      expect(getIsUserCloseToSoftLiquidation(10, 8)).to.eq(true)
      expect(getIsUserCloseToSoftLiquidation(10, null)).to.eq(false)
    })
  })

  describe('getLegacyLiquidationStatus', () => {
    it('returns undefined when required values are missing', () => {
      expect(getLegacyLiquidationStatus(undefined, false, false, '1', '0')).to.eq(undefined)
      expect(getLegacyLiquidationStatus('1', false, false, undefined, '0')).to.eq(undefined)
      expect(getLegacyLiquidationStatus('1', false, false, '1', undefined)).to.eq(undefined)
    })

    it('prioritizes hard liquidation over all other states', () => {
      expect(getLegacyLiquidationStatus('-0.0001', false, false, '1', '100')).to.eq('hardLiquidation')
      expect(getLegacyLiquidationStatus('-0.0001', true, true, '0', '100')).to.eq('hardLiquidation')
    })

    it('returns conversion states when user is below range', () => {
      expect(getLegacyLiquidationStatus('1', false, true, '0.5', '100')).to.eq('incompleteConversion')
      expect(getLegacyLiquidationStatus('1', false, true, '0', '100')).to.eq('fullyConverted')
      expect(getLegacyLiquidationStatus('1', false, true, '-0.1', '100')).to.eq('fullyConverted')
    })

    it('applies dust threshold correctly for soft liquidation', () => {
      expect(getLegacyLiquidationStatus('1', false, false, '1', '0.1')).to.eq('healthy')
      expect(getLegacyLiquidationStatus('1', false, false, '1', '0.1000000001')).to.eq('softLiquidation')
      expect(getLegacyLiquidationStatus('1', true, false, '1', '0')).to.eq('healthy')
      expect(getLegacyLiquidationStatus('1', true, false, '1', '0.0000001')).to.eq('softLiquidation')
    })

    it('returns healthy when no higher-priority condition matches', () => {
      expect(getLegacyLiquidationStatus('0.1', false, false, '1', '0.05')).to.eq('healthy')
    })
  })

  describe('getPositionStatusContent', () => {
    const content = getPositionStatusContent('WETH', 'crvUSD')
    const contentAltSymbols = getPositionStatusContent('WBTC', 'USDC')
    const expectedAlertMetadata: Record<
      UserPositionStatusKey,
      { hasMarketAlert: boolean; severity: 'info' | 'warning' | 'error' }
    > = {
      healthy: { hasMarketAlert: false, severity: 'info' },
      softLiquidation: { hasMarketAlert: true, severity: 'warning' },
      hardLiquidation: { hasMarketAlert: true, severity: 'error' },
      fullyConverted: { hasMarketAlert: true, severity: 'warning' },
      incompleteConversion: { hasMarketAlert: true, severity: 'error' },
    }

    it('has expected alert metadata for every status', () => {
      const statuses = Object.keys(expectedAlertMetadata) as UserPositionStatusKey[]
      expect(Object.keys(content)).to.have.members(statuses)

      statuses.forEach(status => {
        expect(content[status].hasMarketAlert).to.eq(expectedAlertMetadata[status].hasMarketAlert)
        expect(content[status].severity).to.eq(expectedAlertMetadata[status].severity)
      })
    })

    it('interpolates symbols only where expected in titles', () => {
      expect(content.fullyConverted.title).to.not.eq(contentAltSymbols.fullyConverted.title)
      expect(content.fullyConverted.title).to.include('crvUSD')
      expect(contentAltSymbols.fullyConverted.title).to.include('USDC')

      const symbolInvariantStatuses = (Object.keys(expectedAlertMetadata) as UserPositionStatusKey[]).filter(
        status => status !== 'fullyConverted',
      )
      symbolInvariantStatuses.forEach(status => {
        expect(content[status].title).to.eq(contentAltSymbols[status].title)
      })
    })
  })
})

describe('BorrowPositionDetails health status', () => {
  it('hides the market alert', () => {
    cy.mount(<PositionDetailsTest {...baseProps} healthFull={0} healthNotFull={-2} collateral={0} borrow={1} />)
    cy.get('[data-testid="health-details-health-metric"]').should('be.visible')
    cy.get(ALERT_TEST_ID).should('not.exist')
  })

  // userPrices are [0.47, 0.69], the market has no assets type so the long-tail thresholds apply
  const statusCases: { status: PositionStatus; badge: string; health: string; overrides: Partial<typeof baseProps> }[] =
    [
      { status: 'aboveRange', badge: 'Above range', health: '1.4493', overrides: { oraclePrice: 1 } },
      { status: 'nearRange', badge: 'Near range', health: '1.087', overrides: { oraclePrice: 0.75 } },
      { status: 'inRange', badge: 'Soft liquidation', health: '1.00', overrides: { oraclePrice: 0.5 } },
      { status: 'belowRange', badge: 'Below range', health: '1.00', overrides: { oraclePrice: 0.4 } },
      {
        status: 'liquidatable',
        badge: 'Liquidatable',
        health: '1.00',
        overrides: { oraclePrice: 0.4, healthFull: -1, healthNotFull: -1 },
      },
    ]

  statusCases.forEach(({ status, badge, health, overrides }) => {
    it(`shows health ${health}, the ${badge} badge and its tooltip status`, () => {
      const [width, height, breakpoint] = oneViewport()
      cy.viewport(width, height)
      cy.mount(<PositionDetailsTest {...baseProps} {...overrides} />)
      cy.get('[data-testid="health-details-health-metric-value"]').should('have.text', health)
      cy.get('[data-testid="health-details-status-badge"]').should('have.text', badge)
      openTooltip('[data-testid="health-details-health-metric-value"]', breakpoint)
      cy.get(`[data-testid="health-tooltip-status-${status}"]`).should('be.visible')
    })
  })
})
