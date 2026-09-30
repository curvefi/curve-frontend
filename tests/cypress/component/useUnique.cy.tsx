import { useState } from 'react'
import { useUnique } from '@ui/hooks/useUnique'

// Test component for useUnique.
function UseUniqueTest({
  defaultValue,
  callback,
  equals = Object.is,
}: {
  defaultValue: string
  callback: (value: string) => void
  equals?: (a: string, b: string) => boolean
}) {
  const [value, setValue] = useUnique({ defaultValue, callback, equals })

  return (
    <div>
      <button data-testid="set-next" onClick={() => setValue('next')}>
        Set Next
      </button>
      <button data-testid="set-next-again" onClick={() => setValue('next')}>
        Set Next Again
      </button>
      <button data-testid="set-uppercase" onClick={() => setValue('TEST')}>
        Set Uppercase
      </button>
      <button data-testid="set-different" onClick={() => setValue('different')}>
        Set Different
      </button>
      <div data-testid="current-value">{value}</div>
    </div>
  )
}

describe('useUnique', () => {
  it('immediately calls the callback for a unique value', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseUniqueTest defaultValue="initial" callback={callback} />)

    cy.get('[data-testid="set-next"]').click()

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'next')
    cy.get('[data-testid="current-value"]').should('have.text', 'next')
  })

  it('does not call the callback for an equal value', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseUniqueTest defaultValue="initial" callback={callback} />)

    cy.get('[data-testid="set-next"]').click()
    cy.get('[data-testid="set-next-again"]').click()

    cy.get('@callback').should('have.been.calledOnce')
  })

  it('uses a supplied equality function', () => {
    const callback = cy.stub().as('callback')
    const equals = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
    cy.mount(<UseUniqueTest defaultValue="test" callback={callback} equals={equals} />)

    // Values are equal according to the case-insensitive comparison.
    cy.get('[data-testid="set-uppercase"]').click()
    cy.get('@callback').should('not.have.been.called')

    cy.get('[data-testid="set-different"]').click()
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'different')
  })

  it('uses an updated external default as the equality baseline', () => {
    const callback = cy.stub().as('callback')

    // This simulates a component loading a saved value after mounting. The subsequent
    // clear must compare against the loaded value, not the initial empty default.
    function AsyncInitWrapper() {
      const [defaultValue, setDefaultValue] = useState('')
      const [value, setValue] = useUnique({ defaultValue, callback, equals: Object.is })

      return (
        <div>
          <button data-testid="load-async" onClick={() => setDefaultValue('saved search')}>
            Load Async
          </button>
          <button data-testid="clear" onClick={() => setValue('')}>
            Clear
          </button>
          <div data-testid="current-value">{value}</div>
        </div>
      )
    }

    cy.mount(<AsyncInitWrapper />)

    // Simulate an external value arriving asynchronously.
    cy.get('[data-testid="load-async"]').click()
    cy.get('[data-testid="current-value"]').should('have.text', 'saved search')

    // Clearing is a unique change relative to the newly loaded value.
    cy.get('[data-testid="clear"]').click()
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', '')
  })
})
