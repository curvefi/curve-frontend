import { useState } from 'react'
import { useDebounced, useDebounce, useUnique } from '@ui/hooks/useDebounce'

// Test component for useDebounced.
function UseDebouncedTest({
  debounceMs,
  callback,
  onChange,
}: {
  debounceMs: number
  callback: (...args: unknown[]) => void
  onChange?: (...args: unknown[]) => void
}) {
  const debounced = useDebounced(callback, debounceMs, onChange)

  return (
    <div>
      <button data-testid="trigger" onClick={() => debounced('test-value')}>
        Trigger
      </button>
      <button data-testid="trigger-with-args" onClick={() => debounced('arg1', 42, true)}>
        Trigger with args
      </button>
    </div>
  )
}

// Test component for useDebounce.
function UseDebounceTest({
  initialValue,
  debounceMs,
  callback,
}: {
  initialValue: string
  debounceMs: number
  callback: (value: string) => void
}) {
  const [value, setValue] = useDebounce({ initialValue, debounceMs, callback })

  return (
    <div>
      <input data-testid="input" value={value} onChange={e => setValue(e.target.value)} />
      <div data-testid="current-value">{value}</div>
    </div>
  )
}

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

describe('useDebounced', () => {
  beforeEach(() => {
    cy.clock()
  })

  it('calls callback after debounce period', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebouncedTest debounceMs={300} callback={callback} />)

    cy.get('[data-testid="trigger"]').click()
    cy.get('@callback').should('not.have.been.called')

    cy.tick(300)
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'test-value')
  })

  it('cancels the previous timeout when called repeatedly', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebouncedTest debounceMs={300} callback={callback} />)

    cy.get('[data-testid="trigger"]').click()
    cy.tick(100)
    cy.get('[data-testid="trigger"]').click()
    cy.tick(100)
    cy.get('[data-testid="trigger"]').click()
    cy.tick(300)

    cy.get('@callback').should('have.been.calledOnce')
  })

  it('calls onChange immediately when provided', () => {
    const callback = cy.stub().as('callback')
    const onChange = cy.stub().as('onChange')
    cy.mount(<UseDebouncedTest debounceMs={300} callback={callback} onChange={onChange} />)

    cy.get('[data-testid="trigger"]').click()

    cy.get('@onChange').should('have.been.calledOnce')
    cy.get('@onChange').should('have.been.calledWith', 'test-value')
    cy.get('@callback').should('not.have.been.called')

    cy.tick(300)
    cy.get('@callback').should('have.been.calledOnce')
  })

  it('supports multiple arguments', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebouncedTest debounceMs={200} callback={callback} />)

    cy.get('[data-testid="trigger-with-args"]').click()
    cy.tick(200)

    cy.get('@callback').should('have.been.calledWith', 'arg1', 42, true)
  })
})

describe('useDebounce', () => {
  beforeEach(() => {
    cy.clock()
  })

  it('returns its initial value', () => {
    cy.mount(<UseDebounceTest initialValue="initial" debounceMs={300} callback={cy.stub()} />)

    cy.get('[data-testid="current-value"]').should('have.text', 'initial')
  })

  it('updates its value immediately and calls the callback after debounce', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebounceTest initialValue="" debounceMs={300} callback={callback} />)

    cy.get('[data-testid="input"]').type('new value')

    cy.get('[data-testid="current-value"]').should('have.text', 'new value')
    cy.get('@callback').should('not.have.been.called')

    cy.tick(300)
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'new value')
  })

  it('debounces rapid changes', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebounceTest initialValue="" debounceMs={200} callback={callback} />)

    cy.get('[data-testid="input"]').type('a')
    cy.tick(50)
    cy.get('[data-testid="input"]').type('b')
    cy.tick(50)
    cy.get('[data-testid="input"]').type('c')
    cy.tick(200)

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'abc')
  })
})

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
