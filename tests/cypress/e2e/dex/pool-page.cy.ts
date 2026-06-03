import { oneFloat, oneOf } from '@cy/support/generators'
import { clickTab } from '@cy/support/helpers/tabs'
import type { AppRoute } from '@cy/support/routes'
import { API_LOAD_TIMEOUT } from '@cy/support/ui'
import { SLIPPAGE, type SlippageType } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

describe('Pool page', () => {
  const path: AppRoute = `dex/${oneOf(
    'ethereum/pools/factory-tricrypto-0',
    'ethereum/pools/factory-stable-ng-561',
    'arbitrum/pools/2pool',
    'corn/pools/factory-stable-ng-0',
  )}/deposit`
  const slippageType: SlippageType = path.includes('tricrypto') ? 'crypto' : 'stable'
  const slippageConfig = SLIPPAGE[slippageType]
  const formatSlippage = (value: string) => `${Number(value).toFixed(2)}%`

  it('should update slippage settings', () => {
    cy.visitWithoutTestConnector(path)
    clickTab('pool-form-tab', 'deposit', API_LOAD_TIMEOUT)
    cy.get('[data-testid="pool-form-tab-deposit"]', API_LOAD_TIMEOUT).should('have.class', 'Mui-selected')
    cy.get('[data-testid="borrow-slippage-value"]').contains(formatSlippage(slippageConfig.default))
    cy.get('[data-testid="slippage-settings-button"]').click()
    const [isPreset, value] = oneOf<[boolean, string]>(
      [true, oneOf(...slippageConfig.presets)],
      [false, oneFloat(Number(slippageConfig.min), Number(slippageConfig.max)).toFixed(2)],
    )
    if (isPreset) {
      cy.get(`[data-testid="slippage-radio-group"] [value="${value}"]`).click()
      cy.get('[data-testid="slippage-input"]').should('have.value', '') // value is empty, placeholder shown
    } else {
      cy.get('[data-testid="slippage-input"]').clear()
      cy.get('[data-testid="slippage-input"]').type(value)
    }
    cy.get('[data-testid="slippage-save-button"]').click()
    cy.get('[data-testid="borrow-slippage-value"]').contains(formatSlippage(value))
  })
})
