import { useState } from 'react'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import type { Decimal } from '@ui-kit/utils'

function TestComponent() {
  // This value is different from the input value, it is debounced in the component
  const [balanceDebounced, setBalanceDebounced] = useState<Decimal | undefined>(undefined)
  return (
    <ComponentTestWrapper>
      <LargeTokenInput name="amount" onBalance={(newBalance) => setBalanceDebounced(newBalance)} />

      <div>
        Debounced balance value: <span data-testid="debounced-balance">{balanceDebounced}</span>
      </div>
    </ComponentTestWrapper>
  )
}

describe('LargeTokenInput', () => {
  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').should('have.value', '')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click()
    cy.get('input').type('5')
    cy.get('input').blur()
    cy.get('input').should('have.value', '5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click()
    cy.get('input').type('.')
    cy.get('input').should('have.value', '.')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click()
    cy.get('input').type('5')
    cy.get('input').should('have.value', '.5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '.5')
  })
})
