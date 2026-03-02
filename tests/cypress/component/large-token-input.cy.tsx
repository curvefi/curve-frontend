import { useState } from 'react'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'

function TestComponent() {
  const [balance, setBalance] = useState<Decimal | undefined>(undefined)
  // This value is different from balance, as it's not being overwritten by user input and is debounced uniquely.
  const [balanceDebounced, setBalanceDebounced] = useState<Decimal | undefined>(undefined)
  const [onBalanceCalled, setOnBalanceCalled] = useState(false)

  return (
    <ComponentTestWrapper>
      <>
        <LargeTokenInput
          name="amount"
          balance={balance}
          onBalance={(newBalance) => {
            setBalance(newBalance)
            setBalanceDebounced(newBalance)
            setOnBalanceCalled(true)
          }}
        />

        <div>
          Debounced balance value: <span data-testid="debounced-balance">{balanceDebounced}</span>
        </div>

        <div>
          On balance called? <span data-testid="on-balance-called">{onBalanceCalled.toString()}</span>
        </div>
      </>
    </ComponentTestWrapper>
  )
}

describe('LargeTokenInput', () => {
  it('should init with empty values and onBalance event should not be true', () => {
    cy.mount(<TestComponent />)

    cy.get('input').should('have.value', '')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('[data-testid="on-balance-called"]').should('have.text', 'false')
  })

  it('should update state value on blur', () => {
    cy.mount(<TestComponent />)

    // Break up the chain - type first
    cy.get('input').type('5')
    // Then blur separately after DOM settles. Otherwise React re-renders in the middle of a Cypress command and the test fails.
    cy.get('input').blur()
    cy.get('input').should('have.value', '5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')

    // Clear first
    cy.get('input').clear()
    cy.get('input').type('.')
    cy.get('input').should('have.value', '.')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')

    // Type the final digit
    cy.get('input').type('5')
    cy.get('input').should('have.value', '.5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '.5')
  })

  for (const specialChar of ['-', '.']) {
    it(`should allow entering a single ${specialChar} after selecting a previous valid value`, () => {
      cy.mount(<TestComponent />)

      cy.get('input').type('5').blur()
      cy.get('input').should('have.value', '5')
      cy.get('[data-testid="debounced-balance"]').should('have.text', '5')

      cy.get('input').click().type(specialChar).blur()
      cy.get('input').should('have.value', specialChar)
    })
  }
})
