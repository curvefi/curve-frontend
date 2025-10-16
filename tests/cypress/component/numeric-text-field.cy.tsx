import { useState } from 'react'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'
import type { Decimal } from '@ui-kit/utils'

const INITIAL_VALUE = '5'

function TestComponent({ initialValue = INITIAL_VALUE, max }: { initialValue?: Decimal; max?: Decimal }) {
  const [value, setValue] = useState<Decimal | undefined>(initialValue)
  const [tempValue, setTempValue] = useState<string | undefined>(initialValue)

  return (
    <>
      <NumericTextField value={value} onBlur={setValue} onChange={setTempValue} max={max} />
      <div>
        Comitted value: <span data-testid="state-value">{value}</span>
      </div>

      <div>
        Temp value: <span data-testid="state-temp-value">{tempValue}</span>
      </div>
    </>
  )
}

describe('NumericTextField', () => {
  it('has an initial value', () => {
    cy.mount(<TestComponent />)
    cy.get('[data-testid="state-value"]').should('contain', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('contain', INITIAL_VALUE)
  })

  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('6').blur()
    cy.get('[data-testid="state-value"]').should('contain', '6')
  })

  it(`clamps negative values to 0 on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('-10').blur()
    cy.get('[data-testid="state-value"]').should('contain', '0')
  })

  it(`clamps values above max to max value on blur`, () => {
    cy.mount(<TestComponent initialValue="7" max="10" />)
    cy.get('[data-testid="state-value"]').should('contain', '7')
    cy.get('input').click().type('11').blur()
    cy.get('[data-testid="state-value"]').should('contain', '10')
  })

  it(`handles multiple commas and decimals correctly`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('4,55,.').blur()
    cy.get('[data-testid="state-value"]').should('contain', '4.55')
  })

  it(`only allows minus sign as first character`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1-2-3').blur()
    cy.get('input').should('have.value', '123')

    cy.get('input').click().type('-1-2-3')
    cy.get('input').should('have.value', '-123')
  })

  it(`selects all text when input is clicked`, () => {
    cy.mount(<TestComponent initialValue="12345" />)
    cy.get('input').click()
    cy.window().then((win) => {
      const input = win.document.querySelector('input') as HTMLInputElement
      expect(input.selectionStart).to.equal(0)
      expect(input.selectionEnd).to.equal(5)
    })
  })

  it('handles empty input correctly', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().blur()
    cy.get('[data-testid="state-value"]').should('contain', '')
  })

  const soleCharacterCases = ['-', '.']
  for (const character of soleCharacterCases) {
    it(`handles a sole ${character} as character input`, () => {
      cy.mount(<TestComponent />)
      cy.get('input').click().type(character)
      cy.get('[data-testid="state-value"]').should('contain', INITIAL_VALUE)
      cy.get('[data-testid="state-temp-value"]').should('contain', character)
      cy.get('input').blur()
      cy.get('[data-testid="state-value"]').should('contain', '')
      cy.get('[data-testid="state-temp-value"]').should('contain', '')
    })
  }

  it('handles decimal-only input', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('.5').blur()
    cy.get('[data-testid="state-value"]').should('contain', '0.5')
  })

  it('prevents multiple decimal points during typing', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1.2.3')
    cy.get('input').should('have.value', '1.23')
  })

  it('handles leading zeros correctly', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('007.50').blur()
    cy.get('[data-testid="state-value"]').should('contain', '7.5')
  })

  it('handles non-numeric characters gracefully', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1a2b3')
    cy.get('input').should('have.value', '123')
  })

  it('maintains input value during typing before blur', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('4.')
    cy.get('input').should('have.value', '4.')
    cy.get('[data-testid="state-temp-value"]').should('contain', '4')
  })

  it('handles replacing decimal value correctly', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('0.4').blur()
    cy.get('[data-testid="state-value"]').should('contain', '0.4')

    cy.get('input').click().type('.5').blur()
    cy.get('[data-testid="state-value"]').should('contain', '0.5')
  })

  it('changing the amount of zeros in the decimal should not cause rounding to just 0', () => {
    cy.mount(<TestComponent />)

    // Start with empty input
    cy.get('input').click().clear()

    // Type "0.0001" character by character
    cy.get('input').type('0')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0')

    cy.get('input').type('.')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0')

    cy.get('input').type('0')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.0')

    cy.get('input').type('0')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.00')

    cy.get('input').type('0')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.000')

    cy.get('input').type('1')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.0001')

    cy.get('input').type('{backspace}')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.000')

    cy.get('input').type('2')
    cy.get('[data-testid="state-temp-value"]').should('contain', '0.0002')
  })
})
