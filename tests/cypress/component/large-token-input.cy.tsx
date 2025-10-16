import { useState } from 'react'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import type { Decimal } from '@ui-kit/utils'

function TestComponent() {
  const [balance, setBalance] = useState<Decimal | undefined>(undefined)

  return (
    <ComponentTestWrapper>
      <LargeTokenInput name="amount" balance={balance} onBalance={setBalance} />
    </ComponentTestWrapper>
  )
}

describe('LargeTokenInput', () => {
  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').should('have.value', '')
    cy.get('input').click().type('5').blur()
    cy.get('input').should('have.value', '5')
    cy.get('input').click().type('.')
    cy.get('input').should('have.value', '.')
  })
})
