import React, { useState } from 'react'
import { NumericTextField } from '@ui-kit/shared/ui/NumericTextField'

function TestComponent({ initialValue = 5, max }: { initialValue?: number; max?: number }) {
  const [value, setValue] = useState<number | undefined>(initialValue)
  const [tempValue, setTempValue] = useState<number | undefined>(initialValue)

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
  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('[data-testid="state-value"]').should('contain', '5')
    cy.get('input').click().type('6').blur()
    cy.get('[data-testid="state-value"]').should('contain', '6')
  })

  it(`clamps negative values to 0 on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('[data-testid="state-value"]').should('contain', '5')
    cy.get('input').click().type('-10').blur()
    cy.get('[data-testid="state-value"]').should('contain', '0')
  })

  it(`clamps values above max to max value on blur`, () => {
    cy.mount(<TestComponent initialValue={5} max={10} />)
    cy.get('[data-testid="state-value"]').should('contain', '5')
    cy.get('input').click().type('11').blur()
    cy.get('[data-testid="state-value"]').should('contain', '10')
  })

  it(`handles multiple commas and decimals correctly`, () => {
    cy.mount(<TestComponent />)
    cy.get('[data-testid="state-value"]').should('contain', '5')
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
    cy.mount(<TestComponent initialValue={12345} />)
    cy.get('input').click()
    cy.window().then((win) => {
      const input = win.document.querySelector('input') as HTMLInputElement
      expect(input.selectionStart).to.equal(0)
      expect(input.selectionEnd).to.equal(5)
    })
  })

  it('handles empty input correctly', () => {
    cy.mount(<TestComponent initialValue={5} />)
    cy.get('input').click().blur()
    cy.get('[data-testid="state-value"]').should('contain', '')
  })

  it('handles sole minus sign input', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('-').blur()
    cy.get('[data-testid="state-value"]').should('contain', '')
  })

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
})
