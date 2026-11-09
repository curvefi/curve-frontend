import { HealthDetails } from '@/llamalend/features/market-position-details/health/HealthDetails'
import type { HealthThresholds, PositionHealth, PositionStatus } from '@/llamalend/health.utils'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ, q } from '@ui/features/queries/util'
import { lightTheme } from '@ui/features/themes/themes'

const { design } = lightTheme()

/** Thresholds for these tests only, so the cases don't depend on the market values. */
const THRESHOLDS: HealthThresholds = {
  nearRangeHealth: 1.1,
  healthBarFull: 2,
  bufferLeftCritical: 0.25,
  bufferLeftRisky: 0.5,
}

const hexToRgb = (value: string) => {
  const parsed = Number.parseInt(value.replace('#', ''), 16)
  return `rgb(${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255})`
}

const checkBarWidth =
  (expectedPercentage: number) =>
  ([fill]: JQuery<HTMLElement>) => {
    const fillWidth = fill.getBoundingClientRect().width
    const barWidth = fill.parentElement!.getBoundingClientRect().width
    // Allow half a pixel for browser subpixel rounding.
    expect(fillWidth).to.be.closeTo((barWidth * expectedPercentage) / 100, 0.5)
  }

const mountHealthDetails = (position: PositionHealth, error: Error | null = null) =>
  cy.mount(
    <ComponentTestWrapper>
      <HealthDetails
        position={error ? q({ data: position, isLoading: false, error }) : constQ(position)}
        thresholds={THRESHOLDS}
        borrowSymbol="crvUSD"
      />
    </ComponentTestWrapper>,
  )

type FeedbackKey = 'Success' | 'Warning' | 'Error'

type HealthDetailsTestCase = {
  title: string
  position: PositionHealth
  expected: {
    health: string
    healthFeedback: FeedbackKey
    healthBarWidth: number
    liquidationBuffer: string
    liquidationBufferAmount: string
    liquidationBufferFeedback: FeedbackKey
    liquidationBufferBarWidth: number
    badge: string
  }
}

const getPosition = (
  health: Decimal,
  liquidationBuffer: Decimal,
  liquidationBufferAmount: Decimal,
  liquidationBufferLeft: Decimal,
  status: PositionStatus,
): PositionHealth => ({
  health,
  liquidationBuffer,
  liquidationBufferAmount,
  liquidationBufferLeft,
  isLiquidatable: status === 'liquidatable',
  status,
})

const testCases: HealthDetailsTestCase[] = [
  {
    title: 'renders a position above the range with a buffer above its starting gap',
    position: getPosition('1.6', '20', '200', '1.2', 'aboveRange'),
    expected: {
      health: '1.60',
      healthFeedback: 'Success',
      healthBarWidth: 75,
      liquidationBuffer: '20%',
      liquidationBufferAmount: '200 crvUSD',
      liquidationBufferFeedback: 'Success',
      liquidationBufferBarWidth: 100,
      badge: 'Above range',
    },
  },
  {
    title: 'renders a position near the range with a risky buffer',
    position: getPosition('1.05', '8', '80', '0.4', 'nearRange'),
    expected: {
      health: '1.05',
      healthFeedback: 'Warning',
      healthBarWidth: (1 - 1 / 1.05) * 200,
      liquidationBuffer: '8%',
      liquidationBufferAmount: '80 crvUSD',
      liquidationBufferFeedback: 'Warning',
      liquidationBufferBarWidth: 40,
      badge: 'Near range',
    },
  },
  {
    title: 'renders a position in the range',
    position: getPosition('1', '6', '60', '0.3', 'inRange'),
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      healthBarWidth: 0,
      liquidationBuffer: '6%',
      liquidationBufferAmount: '60 crvUSD',
      liquidationBufferFeedback: 'Warning',
      liquidationBufferBarWidth: 30,
      badge: 'Soft liquidation',
    },
  },
  {
    title: 'renders a position below the range with a critical buffer',
    position: getPosition('1', '2.4', '24', '0.12', 'belowRange'),
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      healthBarWidth: 0,
      liquidationBuffer: '2.40%',
      liquidationBufferAmount: '24 crvUSD',
      liquidationBufferFeedback: 'Error',
      liquidationBufferBarWidth: 12,
      badge: 'Below range',
    },
  },
  {
    title: 'renders a liquidatable position',
    position: getPosition('1', '-0.5', '-5', '-0.02', 'liquidatable'),
    expected: {
      health: '1.00',
      healthFeedback: 'Error',
      healthBarWidth: 0,
      liquidationBuffer: '-0.50%',
      liquidationBufferAmount: '-5 crvUSD',
      liquidationBufferFeedback: 'Error',
      liquidationBufferBarWidth: 0,
      badge: 'Liquidatable',
    },
  },
]

describe('Health details', () => {
  testCases.forEach(({ title, position, expected }) => {
    it(title, () => {
      mountHealthDetails(position)

      cy.get('[data-testid="health-details-health-metric-value"]')
        .should('have.text', expected.health)
        .find('p')
        .should('have.css', 'color', hexToRgb(design.Text.TextColors.Feedback[expected.healthFeedback]))
      cy.get('[data-testid="health-details-health-bar-fill"]')
        .should('have.css', 'background-color', hexToRgb(design.Layer.Feedback[expected.healthFeedback]))
        .then(checkBarWidth(expected.healthBarWidth))
      cy.get('[data-testid="health-details-health-bar-badge"]').should('have.text', expected.badge)

      cy.get('[data-testid="health-details-liquidation-buffer-metric-value"]')
        .should('have.text', expected.liquidationBuffer)
        .find('p')
        .should('have.css', 'color', hexToRgb(design.Text.TextColors.Feedback[expected.liquidationBufferFeedback]))
      cy.get('[data-testid="health-details-liquidation-buffer-metric"]').should(
        'contain.text',
        expected.liquidationBufferAmount,
      )
      cy.get('[data-testid="health-details-liquidation-buffer-bar-fill"]')
        .should('have.css', 'background-color', hexToRgb(design.Layer.Feedback[expected.liquidationBufferFeedback]))
        .then(checkBarWidth(expected.liquidationBufferBarWidth))
    })
  })

  it('never rounds a health above 1 down to 1.00', () => {
    mountHealthDetails(getPosition('1.000001', '12', '120', '0.6', 'nearRange'))
    cy.get('[data-testid="health-details-health-metric-value"]').should('have.text', '1.0001')
  })

  it('shows no status from stale data when a source errors', () => {
    mountHealthDetails(getPosition('1', '-0.5', '-5', '-0.02', 'liquidatable'), new Error('rpc failed'))
    cy.get('[data-testid="health-details-health-bar"]').should('be.visible')
    cy.get('[data-testid="health-details-health-bar-badge"]').should('not.exist')
    cy.get('[data-testid="health-details-health-bar-fill"]').then(checkBarWidth(0))
    cy.get('[data-testid="health-details-liquidation-buffer-bar-fill"]').then(checkBarWidth(0))
  })
})
