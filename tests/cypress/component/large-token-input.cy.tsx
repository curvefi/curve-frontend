import { useState } from 'react'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import type { Decimal } from '@ui-kit/utils'

function TestComponent() {
  const [balance, setBalance] = useState<Decimal | undefined>(undefined)

  // This value is different from balance, as it's not being overwritten by user input and is debounced uniquely.
  const [balanceDebounced, setBalanceDebounced] = useState<Decimal | undefined>(undefined)

  return (
    <ComponentTestWrapper>
      <>
        <LargeTokenInput
          name="amount"
          balance={balance}
          onBalance={(newBalance) => {
            setBalance(newBalance)
            setBalanceDebounced(newBalance)
          }}
        />

        <div>
          Debounced balance value: <span data-testid="debounced-balance">{balanceDebounced}</span>
        </div>
      </>
    </ComponentTestWrapper>
  )
}

describe('LargeTokenInput', () => {
  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').should('have.value', '')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click().type('5').blur()
    cy.get('input').should('have.value', '5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click().type('.')
    cy.get('input').should('have.value', '.')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '')
    cy.get('input').click().type('5')
    cy.get('input').should('have.value', '.5')
    cy.get('[data-testid="debounced-balance"]').should('have.text', '.5')
  })
})
