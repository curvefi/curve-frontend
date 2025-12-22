import { useState } from 'react'
import { useDebounced, useDebounce, useDebouncedValue, useUniqueDebounce } from '@ui-kit/hooks/useDebounce'

// Test component for useDebounced
function UseDebouncedTest({
  debounceMs,
  callback,
  onChange,
}: {
  debounceMs: number
  callback: (...args: unknown[]) => void
  onChange?: (...args: unknown[]) => void
}) {
  const [debouncedFn, cancel] = useDebounced(callback, debounceMs, onChange)

  return (
    <div>
      <button data-testid="trigger" onClick={() => debouncedFn('test-value')}>
        Trigger
      </button>
      <button data-testid="trigger-with-args" onClick={() => debouncedFn('arg1', 42, true)}>
        Trigger with args
      </button>
      <button data-testid="cancel" onClick={cancel}>
        Cancel
      </button>
    </div>
  )
}

// Test component for useDebounce
function UseDebounceTest({
  initialValue,
  debounceMs,
  callback,
}: {
  initialValue: string
  debounceMs: number
  callback: (value: string) => void
}) {
  const [value, setValue, cancel] = useDebounce(initialValue, debounceMs, callback)

  return (
    <div>
      <input data-testid="input" value={value} onChange={(e) => setValue(e.target.value)} />
      <div data-testid="current-value">{value}</div>
      <button data-testid="cancel" onClick={cancel}>
        Cancel
      </button>
    </div>
  )
}

// Test component for useDebouncedValue
function UseDebouncedValueTest({
  givenValue,
  debounceMs,
  defaultValue,
}: {
  givenValue: string
  debounceMs?: number
  defaultValue?: string
}) {
  const debouncedValue = useDebouncedValue(givenValue, { debounceMs, defaultValue })

  return (
    <div>
      <div data-testid="debounced-value">{debouncedValue}</div>
      <div data-testid="given-value">{givenValue}</div>
    </div>
  )
}

// Test component for useUniqueDebounce
function UseUniqueDebounceTest({
  defaultValue,
  callback,
  debounceMs,
  equals,
}: {
  defaultValue: string
  callback: (value: string) => void
  debounceMs?: number
  equals?: (a: string, b: string) => boolean
}) {
  const [value, setValue, cancel] = useUniqueDebounce({
    defaultValue,
    callback,
    debounceMs,
    equals,
  })

  return (
    <div>
      <input data-testid="input" value={value} onChange={(e) => setValue(e.target.value)} />
      <div data-testid="current-value">{value}</div>
      <button data-testid="cancel" onClick={cancel}>
        Cancel
      </button>
    </div>
  )
}

// Test component for useUniqueDebounce with objects
function UseUniqueDebounceObjectTest({
  defaultValue,
  callback,
  equals,
}: {
  defaultValue: { id: number; name: string }
  callback: (value: { id: number; name: string }) => void
  equals?: (a: { id: number; name: string }, b: { id: number; name: string }) => boolean
}) {
  const [value, setValue] = useUniqueDebounce({
    defaultValue,
    callback,
    debounceMs: 200,
    equals,
  })

  return (
    <div>
      <button data-testid="set-same-id" onClick={() => setValue({ id: value.id, name: 'different' })}>
        Set Same ID
      </button>
      <button data-testid="set-different-id" onClick={() => setValue({ id: value.id + 1, name: 'different' })}>
        Set Different ID
      </button>
      <div data-testid="current-value">{JSON.stringify(value)}</div>
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

  it('cancels previous timeout when called multiple times', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebouncedTest debounceMs={300} callback={callback} />)

    cy.get('[data-testid="trigger"]').click()
    cy.tick(100)
    cy.get('[data-testid="trigger"]').click()
    cy.tick(100)
    cy.get('[data-testid="trigger"]').click()
    cy.tick(300)

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'test-value')
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

  it('cancel function prevents callback execution', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebouncedTest debounceMs={300} callback={callback} />)

    cy.get('[data-testid="trigger"]').click()
    cy.tick(100)
    cy.get('[data-testid="cancel"]').click()
    cy.tick(300)

    cy.get('@callback').should('not.have.been.called')
  })
})

describe('useDebounce', () => {
  beforeEach(() => {
    cy.clock()
  })

  it('returns initial value', () => {
    const callback = cy.stub()
    cy.mount(<UseDebounceTest initialValue="initial" debounceMs={300} callback={callback} />)

    cy.get('[data-testid="current-value"]').should('have.text', 'initial')
  })

  it('updates value immediately but calls callback after debounce', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebounceTest initialValue="" debounceMs={300} callback={callback} />)

    cy.get('[data-testid="input"]').type('new value')

    cy.get('[data-testid="current-value"]').should('have.text', 'new value')
    cy.get('@callback').should('not.have.been.called')

    cy.tick(300)
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'new value')
  })

  it('debounces multiple rapid changes', () => {
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

  it('cancel function stops pending callback', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseDebounceTest initialValue="" debounceMs={300} callback={callback} />)

    cy.get('[data-testid="input"]').type('test')
    cy.tick(100)
    cy.get('[data-testid="cancel"]').click()
    cy.tick(300)

    cy.get('@callback').should('not.have.been.called')
  })
})

describe('useDebouncedValue', () => {
  beforeEach(() => {
    cy.clock()
  })

  it('returns default value initially when provided', () => {
    cy.mount(<UseDebouncedValueTest givenValue="actual" debounceMs={300} defaultValue="default" />)

    cy.get('[data-testid="debounced-value"]').should('have.text', 'default')
    cy.get('[data-testid="given-value"]').should('have.text', 'actual')
  })

  it('returns given value as default when defaultValue not provided', () => {
    cy.mount(<UseDebouncedValueTest givenValue="test" debounceMs={300} />)

    cy.get('[data-testid="debounced-value"]').should('have.text', 'test')
  })

  it('updates debounced value after delay', () => {
    function DebouncedValueWrapper() {
      const [value, setValue] = useState('initial')
      return (
        <div>
          <button data-testid="update" onClick={() => setValue('updated')}>
            Update
          </button>
          <UseDebouncedValueTest givenValue={value} debounceMs={300} />
        </div>
      )
    }

    cy.mount(<DebouncedValueWrapper />)

    cy.get('[data-testid="debounced-value"]').should('have.text', 'initial')

    cy.get('[data-testid="update"]').click()
    cy.get('[data-testid="given-value"]').should('have.text', 'updated')
    cy.get('[data-testid="debounced-value"]').should('have.text', 'initial')

    cy.tick(300)
    cy.get('[data-testid="debounced-value"]').should('have.text', 'updated')
  })

  it('cancels previous timeout on value change', () => {
    function DebouncedValueWrapper() {
      const [value, setValue] = useState('first')
      return (
        <div>
          <button data-testid="set-second" onClick={() => setValue('second')}>
            Set Second
          </button>
          <button data-testid="set-third" onClick={() => setValue('third')}>
            Set Third
          </button>
          <UseDebouncedValueTest givenValue={value} debounceMs={300} />
        </div>
      )
    }

    cy.mount(<DebouncedValueWrapper />)

    cy.get('[data-testid="set-second"]').click()
    cy.tick(100)
    cy.get('[data-testid="set-third"]').click()
    cy.tick(100)
    cy.get('[data-testid="debounced-value"]').should('have.text', 'first')

    cy.tick(300)
    cy.get('[data-testid="debounced-value"]').should('have.text', 'third')
  })
})

describe('useUniqueDebounce', () => {
  beforeEach(() => {
    cy.clock()
  })

  it('only calls callback when value changes', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseUniqueDebounceTest defaultValue="initial" callback={callback} debounceMs={200} />)

    cy.get('[data-testid="input"]').clear().type('new value')
    cy.tick(200)

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'new value')

    // Set to same value
    cy.get('[data-testid="input"]').clear().type('new value')
    cy.tick(200)

    // Should not call callback again
    cy.get('@callback').should('have.been.calledOnce')
  })

  it('uses custom equality function when provided', () => {
    const callback = cy.stub().as('callback')
    const equals = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

    cy.mount(<UseUniqueDebounceTest defaultValue="test" callback={callback} debounceMs={200} equals={equals} />)

    cy.get('[data-testid="input"]').clear().type('TEST')
    cy.tick(200)

    // Should not call callback because values are equal (case-insensitive)
    cy.get('@callback').should('not.have.been.called')

    cy.get('[data-testid="input"]').clear().type('different')
    cy.tick(200)

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'different')
  })

  it('uses default debounce time of 166ms when not provided', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseUniqueDebounceTest defaultValue="" callback={callback} />)

    cy.get('[data-testid="input"]').type('test')
    cy.tick(166)

    cy.get('@callback').should('have.been.calledOnce')
  })

  it('updates lastValue when defaultValue changes (async initialization)', () => {
    const callback = cy.stub().as('callback')

    // This test simulates the scenario described in the hook's useEffect comment:
    // 1. Component mounts with empty defaultValue (before async load)
    // 2. Async data loads and defaultValue updates to a saved value
    // 3. User clears the input back to empty
    // 4. Callback should fire because we compare against the updated defaultValue, not the original
    function AsyncInitWrapper() {
      const [defaultValue, setDefaultValue] = useState('')
      const [value, setValue] = useUniqueDebounce({
        defaultValue,
        callback,
        debounceMs: 200,
      })

      return (
        <div>
          <button data-testid="load-async" onClick={() => setDefaultValue('saved search')}>
            Load Async
          </button>
          <button data-testid="clear" onClick={() => setValue('')}>
            Clear
          </button>
          <div data-testid="current-value">{value}</div>
          <div data-testid="default-value">{defaultValue}</div>
        </div>
      )
    }

    cy.mount(<AsyncInitWrapper />)

    // Initial state: both values are empty, lastValue.current = ''
    cy.get('[data-testid="current-value"]').should('have.text', '')
    cy.get('[data-testid="default-value"]').should('have.text', '')

    // Simulate async load from localStorage
    // This updates defaultValue to 'saved search' and lastValue.current to 'saved search' via useEffect
    cy.get('[data-testid="load-async"]').click()
    cy.get('[data-testid="default-value"]').should('have.text', 'saved search')

    // User clears the search
    // Without the useEffect update, this would compare '' to '' (initial lastValue)
    // With the useEffect update, this compares '' to 'saved search' (updated lastValue)
    cy.get('[data-testid="clear"]').click()
    cy.tick(200)

    // Callback should fire because '' !== 'saved search'
    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', '')
  })

  it('handles object values with custom equality', () => {
    const callback = cy.stub().as('callback')
    const equals = (a: { id: number; name: string }, b: { id: number; name: string }) => a.id === b.id

    cy.mount(
      <UseUniqueDebounceObjectTest defaultValue={{ id: 1, name: 'first' }} callback={callback} equals={equals} />,
    )

    cy.get('[data-testid="set-same-id"]').click()
    cy.tick(200)

    // Should not call callback because id is the same
    cy.get('@callback').should('not.have.been.called')

    cy.get('[data-testid="set-different-id"]').click()
    cy.tick(200)

    // Should call callback because id changed
    cy.get('@callback').should('have.been.calledOnce')
  })

  it('debounces rapid changes and only fires once for unique values', () => {
    const callback = cy.stub().as('callback')
    cy.mount(<UseUniqueDebounceTest defaultValue="" callback={callback} debounceMs={200} />)

    cy.get('[data-testid="input"]').type('a')
    cy.tick(50)
    cy.get('[data-testid="input"]').type('b')
    cy.tick(50)
    cy.get('[data-testid="input"]').type('c')
    cy.tick(200)

    cy.get('@callback').should('have.been.calledOnce')
    cy.get('@callback').should('have.been.calledWith', 'abc')
  })

  it('handles primitive number values correctly', () => {
    const callback = cy.stub().as('callback')

    function NumberTest() {
      const [value, setValue] = useUniqueDebounce({
        defaultValue: 0,
        callback,
        debounceMs: 200,
      })

      return (
        <div>
          <button data-testid="set-5" onClick={() => setValue(5)}>
            Set 5
          </button>
          <button data-testid="set-5-again" onClick={() => setValue(5)}>
            Set 5 Again
          </button>
          <button data-testid="set-10" onClick={() => setValue(10)}>
            Set 10
          </button>
          <div data-testid="value">{value}</div>
        </div>
      )
    }

    cy.mount(<NumberTest />)

    cy.get('[data-testid="set-5"]').click()
    cy.tick(200)
    cy.get('@callback').should('have.been.calledWith', 5)

    cy.get('[data-testid="set-5-again"]').click()
    cy.tick(200)
    cy.get('@callback').should('have.been.calledOnce') // No additional call

    cy.get('[data-testid="set-10"]').click()
    cy.tick(200)
    cy.get('@callback').should('have.been.calledTwice')
    cy.get('@callback').should('have.been.calledWith', 10)
  })
})
