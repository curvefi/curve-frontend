import { oneFloat, oneOf } from '@cy/support/generators'
import { LOAD_TIMEOUT } from '@cy/support/ui'

describe('Pool page', () => {
  const path = `/dex/${oneOf(
    'ethereum/pools/factory-tricrypto-0',
    'ethereum/pools/factory-stable-ng-561',
    'arbitrum/pools/2pool',
    'corn/pools/factory-stable-ng-0',
  )}/deposit`

  it('should update slippage settings', () => {
    cy.visit(path)
    cy.get('[data-testid="tab-deposit"]', LOAD_TIMEOUT).should('have.class', 'Mui-selected')
    cy.get('[data-testid="borrow-slippage-value"]').contains(path.includes('crypto') ? '0.10%' : '0.03%')
    cy.get('[data-testid="slippage-settings-button"]').click()
    const [isPreset, value] = oneOf([true, oneOf('0.1', '0.5'), [false, oneFloat(5).toFixed(2)]])
    if (isPreset) {
      cy.get(`[data-testid="slippage-radio-group"] [value="${value}"]`).click()
      cy.get('[data-testid="slippage-input-disabled"]').should('be.visible') // check it's disabled
    } else {
      cy.get('[data-testid^="slippage-input"]').type(value)
      cy.get('[data-testid="slippage-input-selected"]').blur()
    }
    cy.get('[data-testid="slippage-save-button"]').click()
    cy.get('[data-testid="borrow-slippage-value"]').contains(`${Number(value).toFixed(2)}%`)
  })
})
