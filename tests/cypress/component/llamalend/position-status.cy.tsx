import { BorrowPositionDetails, type BorrowPositionDetailsProps } from '@/llamalend/features/market-position-details'
import { getLiquidationStatus } from '@/llamalend/llama.utils'
import type { UserPositionStatusKey } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'

const ALERT_TEST_ID = '[data-testid="borrow-position-status-alert"]'

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

const mountPositionDetails = (props: BorrowPositionDetailsProps) =>
  cy.mount(
    <ComponentTestWrapper>
      <BorrowPositionDetails {...props} />
    </ComponentTestWrapper>,
  )

const toLiquidationAlert = (status: UserPositionStatusKey | undefined) => ({
  softLiquidation: status === 'softLiquidation',
  hardLiquidation: status === 'hardLiquidation',
  status,
})

const withSymbols = (
  status: UserPositionStatusKey | undefined,
  { collateralSymbol = 'WETH', borrowSymbol = 'crvUSD' }: { collateralSymbol?: string; borrowSymbol?: string } = {},
): BorrowPositionDetailsProps => ({
  ...baseProps,
  liquidationAlert: toLiquidationAlert(status),
  collateralValue: {
    ...baseProps.collateralValue,
    collateral: { ...baseProps.collateralValue.collateral, symbol: collateralSymbol },
    borrow: { ...baseProps.collateralValue.borrow, symbol: borrowSymbol },
  },
})

type StatusCase =
  | { status: UserPositionStatusKey; hasAlert: false }
  | { status: UserPositionStatusKey; hasAlert: true; severity: 'warning' | 'error'; title: string }

const statusCases: StatusCase[] = [
  { status: 'healthy', hasAlert: false },
  {
    status: 'softLiquidation',
    hasAlert: true,
    severity: 'warning',
    title: 'Liquidation protection active',
  },
  {
    status: 'hardLiquidation',
    hasAlert: true,
    severity: 'error',
    title: 'Position can be hard-liquidated',
  },
  {
    status: 'fullyConverted',
    hasAlert: true,
    severity: 'warning',
    title: 'Fully converted to crvUSD',
  },
  {
    status: 'incompleteConversion',
    hasAlert: true,
    severity: 'error',
    title: 'Position at risk - incomplete conversion',
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
    mountPositionDetails(withSymbols(undefined))
    cy.get(ALERT_TEST_ID).should('not.exist')
  })

  statusCases.forEach(testCase => {
    it(`${testCase.hasAlert ? 'renders' : 'hides'} market alert for ${testCase.status} status`, () => {
      mountPositionDetails(withSymbols(testCase.status))

      if (!testCase.hasAlert) {
        cy.get(ALERT_TEST_ID).should('not.exist')
        return
      }

      cy.get(ALERT_TEST_ID)
        .should('be.visible')
        .within(() => {
          cy.contains(testCase.title).should('be.visible')
          cy.get('p').invoke('text').should('match', /\S/)
        })

      cy.get(ALERT_TEST_ID).invoke('text').should('not.include', 'undefined')
      cy.get(ALERT_TEST_ID).invoke('attr', 'class').should('match', expectedSeverityClass(testCase.severity))
    })
  })

  const symbolInterpolationCases = [
    { status: 'softLiquidation' as const, expectedTokens: ['WBTC', 'USDC'], unexpectedTokens: [] },
    { status: 'fullyConverted' as const, expectedTokens: ['WBTC', 'USDC'], unexpectedTokens: [] },
    { status: 'incompleteConversion' as const, expectedTokens: ['WBTC'], unexpectedTokens: ['USDC'] },
  ]

  symbolInterpolationCases.forEach(({ status, expectedTokens, unexpectedTokens }) => {
    it(`renders symbol-interpolated description for ${status}`, () => {
      mountPositionDetails(withSymbols(status, { collateralSymbol: 'WBTC', borrowSymbol: 'USDC' }))

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
