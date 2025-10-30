import { oneFloat, oneOf } from '@cy/support/generators'

describe('Pool page', () => {
  const path = `/dex/${oneOf(
    'ethereum/pools/factory-tricrypto-0',
    'ethereum/pools/factory-stable-ng-561',
    'arbitrum/pools/2pool',
    'corn/pools/factory-stable-ng-0',
  )}/deposit`

  it('should update slippage settings', () => {
    cy.visit(path)
    cy.get('[data-testid="tab-deposit"]').should('have.class', 'Mui-selected')
    cy.get('[data-testid="borrow-slippage-value"]').contains(path.includes('crypto') ? '0.1%' : '0.03%')
    const [usePreset, value] = oneOf([true, oneOf('0.1', '0.5'), [false, oneFloat().toFixed(1)]])
    if (usePreset) {
      cy.get(`[data-testid="slippage-radio-group"] [value="${value}"]`).click()
      cy.get('[data-testid="slippage-input-disabled"]').should('have.value', value)
    } else {
      cy.get('[data-testid^="slippage-input"]').type(value)
      cy.get('[data-testid="slippage-input-selected"]').blur()
    }
    cy.get('[data-testid="slippage-save-button"]').click()
    cy.get('[data-testid="borrow-slippage-value"]').contains(`${value}%`)
  })
})
