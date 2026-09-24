import { useState } from 'react'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'

// Mirrors a controlled form field updated by LargeTokenInput's callback.
function TestComponent() {
  const [balance, setBalance] = useState<Decimal | undefined>(undefined)
  // Mirrors the form value updated by the input callback.
  const [formBalance, setFormBalance] = useState<Decimal | undefined>(undefined)
  const [onBalanceCalled, setOnBalanceCalled] = useState(false)

  return (
    <ComponentTestWrapper>
      <>
        <LargeTokenInput
          name="amount"
          balance={balance}
          onBalance={newBalance => {
            setBalance(newBalance)
            setFormBalance(newBalance)
            setOnBalanceCalled(true)
          }}
        />

        <div>
          Form balance value: <span data-testid="form-balance">{formBalance}</span>
        </div>

        <div>
          On balance called? <span data-testid="on-balance-called">{onBalanceCalled.toString()}</span>
        </div>
      </>
    </ComponentTestWrapper>
  )
}

describe('LargeTokenInput', () => {
  it('initializes with an empty form value without emitting a change', () => {
    cy.mount(<TestComponent />)

    cy.get('input').should('have.value', '')
    cy.get('[data-testid="form-balance"]').should('have.text', '')
    cy.get('[data-testid="on-balance-called"]').should('have.text', 'false')
  })

  it('immediately replaces an already-valid form value', () => {
    cy.mount(<TestComponent />)

    cy.get('input').type('10')
    cy.get('[data-testid="form-balance"]').should('have.text', '10')

    cy.get('input').clear().type('20')
    cy.get('input').should('have.value', '20')
    cy.get('[data-testid="form-balance"]').should('have.text', '20')
    cy.get('[data-testid="on-balance-called"]').should('have.text', 'true')
  })

  it('immediately clears a previously valid form value', () => {
    cy.mount(<TestComponent />)

    cy.get('input').type('5')
    cy.get('[data-testid="form-balance"]').should('have.text', '5')

    cy.get('input').clear()
    cy.get('input').should('have.value', '')
    cy.get('[data-testid="form-balance"]').should('have.text', '')
  })

  for (const specialChar of ['-', '.']) {
    it(`should allow entering a single ${specialChar} after selecting a previous valid value`, () => {
      cy.mount(<TestComponent />)

      cy.get('input').type('5')
      cy.get('input').should('have.value', '5')
      cy.get('[data-testid="form-balance"]').should('have.text', '5')

      // A temporary invalid value must invalidate the form rather than leave 5 actionable.
      cy.get('input').clear().type(specialChar)
      cy.get('input').should('have.value', specialChar)
      cy.get('[data-testid="form-balance"]').should('have.text', '')
    })
  }
})
