import { zeroAddress } from 'viem'
import { MarketContext, createMarketContextValue } from '@/llamalend/features/market-context'
import { BorrowPositionDetails } from '@/llamalend/features/market-position-details'
import { getLiquidationStatus } from '@/llamalend/llama.utils'
import type { MarketTemplate, UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import {
  getMarketLiquidationBandKey,
  getMarketOraclePriceBandKey,
  getMarketOraclePriceKey,
} from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserCurrentLeverageKey } from '@/llamalend/queries/user'
import { getUserBandsKey } from '@/llamalend/queries/user/user-bands.query'
import { getUserHealthKey } from '@/llamalend/queries/user/user-health.query'
import { getUserPricesKey } from '@/llamalend/queries/user/user-prices.query'
import { getUserStateKey } from '@/llamalend/queries/user/user-state.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { getTokenUsdRateKey } from '@ui-kit/lib/model/entities/token-usd-rate'
import { TestQueryProvider } from '@ui-kit/lib/queries/test-query.provider.test'
import { MarketType } from '@ui-kit/types/market'
import { constQ, type Range } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const ALERT_TEST_ID = '[data-testid="borrow-position-status-alert"]'

const baseProps = {
  params: { chainId: 1, marketId: 'one-way-market-7', userAddress: zeroAddress },
  healthNotFull: 1.56 as number | null,
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
  marketLiquidationBand: null as number | null,
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
  marketLiquidationBand,
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
          [getMarketLiquidationBandKey(params), marketLiquidationBand],
          [getTokenUsdRateKey({ ...params, tokenAddress: collateralAddress }), collateralUsdPrice],
          [getTokenUsdRateKey({ ...params, tokenAddress: borrowAddress }), borrowUsdPrice],
          [getUserStateKey(params), { collateral: `${collateral}`, stablecoin: `${borrow}`, debt: `${totalDebt}` }],
        ]}
      >
        <BorrowPositionDetails compact={false} />
      </TestQueryProvider>
    </MarketContext>
  </ComponentTestWrapper>
)

type StatusCase = {
  status: UserPositionStatusKey
  severity?: 'warning' | 'error'
  title?: string
  overrides?: Partial<typeof baseProps>
}

const statusCases: StatusCase[] = [
  { status: 'healthy' },
  {
    status: 'softLiquidation',
    severity: 'warning',
    title: 'Liquidation protection active',
    overrides: { healthFull: 30, borrow: 1.5 },
  },
  {
    status: 'hardLiquidation',
    severity: 'error',
    title: 'Position can be hard-liquidated',
    overrides: { healthFull: 0, healthNotFull: -2, collateral: 0, borrow: 1 },
  },
  {
    status: 'fullyConverted',
    severity: 'warning',
    title: 'Fully converted to crvUSD',
    overrides: { healthFull: 0, borrow: 1.8, collateral: 0, userBands: [-10, -6] },
  },
  {
    status: 'incompleteConversion',
    severity: 'error',
    title: 'Position at risk - incomplete conversion',
    overrides: { healthFull: 3, borrow: 1.5, collateral: 0.3, userBands: [-10, -6] },
  },
]

const expectedSeverityClass = (severity: 'info' | 'warning' | 'error') =>
  new RegExp(`MuiAlert-(?:outlined|color)${({ info: 'Info', warning: 'Warning', error: 'Error' } as const)[severity]}`)

describe('Position status logic', () => {
  describe('getLiquidationStatus', () => {
    it('returns undefined when required values are missing', () => {
      expect(getLiquidationStatus(undefined, false, false, '1', '0')).to.eq(undefined)
      expect(getLiquidationStatus('1', false, false, undefined, '0')).to.eq(undefined)
      expect(getLiquidationStatus('1', false, false, '1', undefined)).to.eq(undefined)
    })

    it('prioritizes hard liquidation over all other states', () => {
      expect(getLiquidationStatus('-0.0001', false, false, '1', '100')).to.eq('hardLiquidation')
      expect(getLiquidationStatus('-0.0001', true, true, '0', '100')).to.eq('hardLiquidation')
    })

    it('returns conversion states when user is below range', () => {
      expect(getLiquidationStatus('1', false, true, '0.5', '100')).to.eq('incompleteConversion')
      expect(getLiquidationStatus('1', false, true, '0', '100')).to.eq('fullyConverted')
      expect(getLiquidationStatus('1', false, true, '-0.1', '100')).to.eq('fullyConverted')
    })

    it('applies dust threshold correctly for soft liquidation', () => {
      expect(getLiquidationStatus('1', false, false, '1', '0.1')).to.eq('healthy')
      expect(getLiquidationStatus('1', false, false, '1', '0.1000000001')).to.eq('softLiquidation')
      expect(getLiquidationStatus('1', true, false, '1', '0')).to.eq('healthy')
      expect(getLiquidationStatus('1', true, false, '1', '0.0000001')).to.eq('softLiquidation')
    })

    it('returns healthy when no higher-priority condition matches', () => {
      expect(getLiquidationStatus('0.1', false, false, '1', '0.05')).to.eq('healthy')
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

describe('BorrowPositionDetails status alerts', () => {
  it('hides market alert when status is undefined', () => {
    cy.mount(<PositionDetailsTest {...baseProps} healthNotFull={null} />)
    cy.get(ALERT_TEST_ID).should('not.exist')
  })

  statusCases.forEach(({ overrides, severity, status, title }) => {
    const hasAlert = !!severity
    it(`${hasAlert ? 'renders' : 'hides'} market alert for ${status} status`, () => {
      cy.mount(<PositionDetailsTest {...baseProps} {...overrides} />)

      if (!hasAlert) {
        cy.get(ALERT_TEST_ID).should('not.exist')
        return
      }

      cy.get(ALERT_TEST_ID)
        .should('be.visible')
        .within(() => {
          cy.contains(title ?? 'no title expected').should('be.visible')
          cy.get('p').invoke('text').should('match', /\S/)
        })

      cy.get(ALERT_TEST_ID).invoke('text').should('not.include', 'undefined')
      cy.get(ALERT_TEST_ID).invoke('attr', 'class').should('match', expectedSeverityClass(severity))
    })
  })

  const symbolInterpolationCases = [
    { status: 'softLiquidation' as const, expectedTokens: ['WBTC', 'USDC'], unexpectedTokens: [] },
    { status: 'fullyConverted' as const, expectedTokens: ['WBTC', 'USDC'], unexpectedTokens: [] },
    { status: 'incompleteConversion' as const, expectedTokens: ['WBTC'], unexpectedTokens: ['USDC'] },
  ]

  symbolInterpolationCases.forEach(({ status, expectedTokens, unexpectedTokens }) => {
    it(`renders symbol-interpolated description for ${status}`, () => {
      const overrides = statusCases.find(s => s.status === status)?.overrides
      cy.mount(<PositionDetailsTest {...baseProps} {...overrides} collateralSymbol="WBTC" borrowSymbol="USDC" />)

      cy.get(ALERT_TEST_ID)
        .should('be.visible')
        .within(() => {
          expectedTokens.forEach(token => {
            cy.contains(token).should('be.visible')
          })
          unexpectedTokens.forEach(token => {
            cy.contains(token).should('not.exist')
          })
        })
    })
  })
})
