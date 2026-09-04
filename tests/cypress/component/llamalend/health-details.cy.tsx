import { HealthDetails } from '@/llamalend/features/market-position-details/health/HealthDetails'
import type { HealthQuery } from '@/llamalend/queries/user/user-health.query'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { lightTheme } from '@evm-ui/themes'
import { decimalDiv, decimalMultiply, decimalSum } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ } from '@ui/features/queries/util'

const { design } = lightTheme()
const DISCOUNT_GAP: Decimal = '3'

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

const getHealthQuery = (health: Decimal, liquidationBuffer: Decimal): HealthQuery => {
  const healthNotFull = decimalMultiply(decimalDiv(liquidationBuffer, '100'), DISCOUNT_GAP)

  return constQ({
    health,
    healthFactor: decimalSum('1', decimalDiv(health, '100')),
    healthNotFull,
    liquidationBuffer,
  })
}

const mountHealthDetails = (health: Decimal, liquidationBuffer: Decimal) =>
  cy.mount(
    <ComponentTestWrapper>
      <HealthDetails healthQuery={getHealthQuery(health, liquidationBuffer)} />
    </ComponentTestWrapper>,
  )

type HealthDetailsTestCase = {
  title: string
  health: Decimal
  liquidationBuffer: Decimal
  expected: {
    healthFactor: string
    healthColor: string
    healthBarWidth: number
    liquidationBuffer: string
    debtNotional: string
    liquidationBufferColor: string
    liquidationBufferBarWidth: number
    badge?: 'Soft Liquidation' | 'Hard Liquidation'
  }
}

const testCases: HealthDetailsTestCase[] = [
  {
    title: 'renders pristine health',
    health: '426.9',
    liquidationBuffer: '108',
    expected: {
      healthFactor: '5.27',
      healthColor: design.Layer.Feedback.Info,
      healthBarWidth: 100,
      liquidationBuffer: '108%',
      debtNotional: '(3.24% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Info,
      liquidationBufferBarWidth: 100,
    },
  },
  {
    title: 'renders good health',
    health: '24.1',
    liquidationBuffer: '110',
    expected: {
      healthFactor: '1.24',
      healthColor: design.Layer.Feedback.Success,
      healthBarWidth: 24.1,
      liquidationBuffer: '110%',
      debtNotional: '(3.30% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Info,
      liquidationBufferBarWidth: 100,
    },
  },
  {
    title: 'renders caution health',
    health: '7.9',
    liquidationBuffer: '110',
    expected: {
      healthFactor: '1.079',
      healthColor: design.Layer.Feedback.Caution,
      healthBarWidth: 7.9,
      liquidationBuffer: '110%',
      debtNotional: '(3.30% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Info,
      liquidationBufferBarWidth: 100,
    },
  },
  {
    title: 'renders tight health',
    health: '4.9',
    liquidationBuffer: '110',
    expected: {
      healthFactor: '1.049',
      healthColor: design.Layer.Feedback.Error,
      healthBarWidth: 4.9,
      liquidationBuffer: '110%',
      debtNotional: '(3.30% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Info,
      liquidationBufferBarWidth: 100,
    },
  },
  {
    title: 'renders soft liquidation with a risky buffer',
    health: '0',
    liquidationBuffer: '22.5',
    expected: {
      healthFactor: '1.00',
      healthColor: design.Layer.Feedback.Error,
      healthBarWidth: 0,
      liquidationBuffer: '22.50%',
      debtNotional: '(0.68% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Warning,
      liquidationBufferBarWidth: 22.5,
      badge: 'Soft Liquidation',
    },
  },
  {
    title: 'renders soft liquidation with a critical buffer',
    health: '0',
    liquidationBuffer: '2.4',
    expected: {
      healthFactor: '1.00',
      healthColor: design.Layer.Feedback.Error,
      healthBarWidth: 0,
      liquidationBuffer: '2.40%',
      debtNotional: '(0.07% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Error,
      liquidationBufferBarWidth: 2.4,
      badge: 'Soft Liquidation',
    },
  },
  {
    title: 'renders the hard liquidation threshold',
    health: '0',
    liquidationBuffer: '0',
    expected: {
      healthFactor: '1.00',
      healthColor: design.Layer.Feedback.Error,
      healthBarWidth: 0,
      liquidationBuffer: '0%',
      debtNotional: '(0% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Error,
      liquidationBufferBarWidth: 0,
      badge: 'Hard Liquidation',
    },
  },
  {
    title: 'renders a position beyond liquidation',
    health: '0',
    liquidationBuffer: '-20',
    expected: {
      healthFactor: '1.00',
      healthColor: design.Layer.Feedback.Error,
      healthBarWidth: 0,
      liquidationBuffer: '-20%',
      debtNotional: '(-0.60% of debt)',
      liquidationBufferColor: design.Layer.Feedback.Error,
      liquidationBufferBarWidth: 0,
      badge: 'Hard Liquidation',
    },
  },
]

describe('Health details', () => {
  testCases.forEach(({ title, health, liquidationBuffer, expected }) => {
    it(title, () => {
      mountHealthDetails(health, liquidationBuffer)

      cy.get('[data-testid="health-details-health-metric-value"]')
        .should('have.text', expected.healthFactor)
        .find('p')
        .should('have.css', 'color', hexToRgb(expected.healthColor))
      cy.get('[data-testid="health-details-health-bar-fill"]')
        .should('have.css', 'background-color', hexToRgb(expected.healthColor))
        .then(checkBarWidth(expected.healthBarWidth))

      cy.get('[data-testid="health-details-liquidation-buffer-metric-value"]').should(
        'have.text',
        expected.liquidationBuffer,
      )
      cy.get('[data-testid="health-details-liquidation-buffer-metric"]').should('contain.text', expected.debtNotional)
      cy.get('[data-testid="health-details-liquidation-buffer-bar-fill"]')
        .should('have.css', 'background-color', hexToRgb(expected.liquidationBufferColor))
        .then(checkBarWidth(expected.liquidationBufferBarWidth))

      if (expected.badge) {
        cy.get('[data-testid="health-details-health-bar-badge"]').should('have.text', expected.badge)
      } else {
        cy.get('[data-testid="health-details-health-bar-badge"]').should('not.exist')
      }
    })
  })
})
