import { HealthDetails } from '@/llamalend/features/market-position-details/health/HealthDetails'
import { getPositionHealthThresholds, type PositionHealth, type PositionStatus } from '@/llamalend/health.utils'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Decimal } from '@primitives/decimal.utils'
import { MarketAssetsType } from '@primitives/llamalend/markets.constants'
import { q } from '@ui/features/queries/util'
import { lightTheme } from '@ui/features/themes/themes'

const { design } = lightTheme()

const hexToRgb = (value: string) => {
  const parsed = Number.parseInt(value.replace('#', ''), 16)
  return `rgb(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255})`
}

const mountHealthDetails = (position: PositionHealth, assetsType: MarketAssetsType, error: Error | null = null) =>
  cy.mount(
    <ComponentTestWrapper>
      <HealthDetails
        position={q({ data: position, isLoading: false, error })}
        thresholds={getPositionHealthThresholds(assetsType)}
        borrowSymbol="crvUSD"
      />
    </ComponentTestWrapper>,
  )

type FeedbackKey = 'Success' | 'Warning' | 'Error'

type HealthDetailsTestCase = {
  title: string
  position: PositionHealth
  assetsType: MarketAssetsType
  expected: {
    health: string
    healthFeedback: FeedbackKey
    liquidationBuffer: string
    liquidationBufferAmount: string
    liquidationBufferFeedback: FeedbackKey
    badge: string
  }
}

const getPosition = (
  health: Decimal,
  liquidationBuffer: Decimal,
  liquidationBufferAmount: Decimal,
  liquidationBufferShare: Decimal,
  status: PositionStatus,
): PositionHealth => ({
  health,
  liquidationBuffer,
  liquidationBufferAmount,
  liquidationBufferShare,
  isLiquidatable: status === 'liquidatable',
  status,
})

const testCases: HealthDetailsTestCase[] = [
  {
    title: 'renders a position above the range with a buffer above its starting gap',
    position: getPosition('1.6', '20', '200', '1.2', 'aboveRange'),
    assetsType: MarketAssetsType.BlueChip,
    expected: {
      health: '1.60',
      healthFeedback: 'Success',
      liquidationBuffer: '20%',
      liquidationBufferAmount: '200 crvUSD',
      liquidationBufferFeedback: 'Success',
      badge: 'Above range',
    },
  },
  {
    title: 'renders a position near the range with a risky buffer',
    position: getPosition('1.05', '8', '80', '0.4', 'nearRange'),
    assetsType: MarketAssetsType.BlueChip,
    expected: {
      health: '1.05',
      healthFeedback: 'Warning',
      liquidationBuffer: '8%',
      liquidationBufferAmount: '80 crvUSD',
      liquidationBufferFeedback: 'Warning',
      badge: 'Near range',
    },
  },
  {
    title: 'renders a position in the range',
    position: getPosition('1', '6', '60', '0.3', 'inRange'),
    assetsType: MarketAssetsType.Correlated,
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      liquidationBuffer: '6%',
      liquidationBufferAmount: '60 crvUSD',
      liquidationBufferFeedback: 'Warning',
      badge: 'Soft liquidation',
    },
  },
  {
    title: 'renders a position below the range with a critical buffer',
    position: getPosition('1', '2.4', '24', '0.08', 'belowRange'),
    assetsType: MarketAssetsType.LongTail,
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      liquidationBuffer: '2.40%',
      liquidationBufferAmount: '24 crvUSD',
      liquidationBufferFeedback: 'Error',
      badge: 'Below range',
    },
  },
  {
    title: 'renders a liquidatable position',
    position: getPosition('1', '-0.5', '-5', '-0.02', 'liquidatable'),
    assetsType: MarketAssetsType.LongTail,
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      liquidationBuffer: '-0.50%',
      liquidationBufferAmount: '-5 crvUSD',
      liquidationBufferFeedback: 'Error',
      badge: 'Liquidatable',
    },
  },
]

describe('Health details', () => {
  testCases.forEach(({ title, position, assetsType, expected }) => {
    it(title, () => {
      mountHealthDetails(position, assetsType)

      cy.get('[data-testid="health-details-health-metric-value"]')
        .should('have.text', expected.health)
        .find('p')
        .should('have.css', 'color', hexToRgb(design.Text.TextColors.Feedback[expected.healthFeedback]))
      cy.get('[data-testid="health-details-status-badge"]').should('have.text', expected.badge)

      cy.get('[data-testid="health-details-liquidation-buffer-metric-value"]')
        .should('contain.text', expected.liquidationBuffer)
        .find('p')
        .first()
        .should('have.css', 'color', hexToRgb(design.Text.TextColors.Feedback[expected.liquidationBufferFeedback]))
      cy.get('[data-testid="health-details-liquidation-buffer-metric"]').should(
        'contain.text',
        expected.liquidationBufferAmount,
      )
    })
  })

  it('never rounds a health above 1 down to 1.00', () => {
    mountHealthDetails(getPosition('1.000001', '12', '120', '0.6', 'nearRange'), MarketAssetsType.LongTail)
    cy.get('[data-testid="health-details-health-metric-value"]').should('have.text', '1.0001')
  })

  it('keeps the last status next to the error icon when a source errors', () => {
    mountHealthDetails(
      getPosition('1', '-0.5', '-5', '-0.02', 'liquidatable'),
      MarketAssetsType.LongTail,
      new Error('rpc failed'),
    )
    cy.get('[data-testid="health-details-health-metric"] [data-error="Error: rpc failed"]').should('be.visible')
    cy.get('[data-testid="health-details-health-metric-value"]').should('have.text', '1.00')
    cy.get('[data-testid="health-details-status-badge"]').should('have.text', 'Liquidatable')
  })
})
