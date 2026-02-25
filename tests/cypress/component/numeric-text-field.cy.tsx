import '@cy/eip6963-test-setup'
import { useState } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { NumericTextField, type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { formatNumber } from '@ui-kit/utils'
const INITIAL_VALUE = '5'

function TestComponent({
  initialValue = INITIAL_VALUE,
  max,
  min,
  format,
}: {
  initialValue?: Decimal
  max?: Decimal
  min?: Decimal
  format?: NumericTextFieldProps['format']
}) {
  const [value, setValue] = useState<Decimal | undefined>(initialValue)
  const [tempValue, setTempValue] = useState<string | undefined>(initialValue)

  return (
    <>
      <NumericTextField value={value} onBlur={setValue} onChange={setTempValue} max={max} min={min} format={format} />
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
    cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('have.text', INITIAL_VALUE)
  })

  it(`updates state value on blur`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('6').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '6')
  })

  it(`clamps negative values to 0 on blur`, () => {
    cy.mount(<TestComponent min="0" />)
    cy.get('input').click().type('-10')
    cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('have.text', '-10')
    cy.get('input').click().clear().type('-10').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '0')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '0')
  })

  it(`clamps values above max to max value on blur`, () => {
    cy.mount(<TestComponent max="10" />)
    cy.get('input').click().type('11')
    cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('have.text', '11')
    cy.get('input').click().clear().type('11').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '10')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '10')
  })

  it(`handles multiple commas and decimals correctly`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('4,55,.').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '4.55')
  })

  it(`only allows minus sign as first character`, () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1-2-3').blur()
    cy.get('input').should('have.value', '123')

    cy.get('input').click().type('-1-2-3').blur()
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
    cy.get('input').click().clear().blur()
    cy.get('[data-testid="state-value"]').should('have.text', '')
  })

  const soleCharacterCases = ['-', '.', ',']
  for (const character of soleCharacterCases) {
    it(`handles a sole ${character} as character input`, () => {
      cy.mount(<TestComponent />)
      cy.get('input').click().type(character)
      cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
      cy.get('[data-testid="state-temp-value"]').should('have.text', character === ',' ? '.' : character)
      cy.get('input').click().clear().type(character).blur()
      cy.get('[data-testid="state-value"]').should('have.text', '')
      cy.get('[data-testid="state-temp-value"]').should('have.text', '')
    })
  }

  it('handles decimal-only input', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('.5')
    cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('have.text', '.5')
    cy.get('input').click().clear().type('.5').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '0.5')
  })

  it('prevents multiple decimal points during typing', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1.2.3').blur()
    cy.get('input').should('have.value', '1.23')
  })

  it('handles leading zeros correctly', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('007.50')
    cy.get('[data-testid="state-value"]').should('have.text', INITIAL_VALUE)
    cy.get('[data-testid="state-temp-value"]').should('have.text', '007.50')
    cy.get('input').click().clear().type('007.50').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '7.5')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '7.5')
  })

  it('handles non-numeric characters gracefully', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('1a2b3').blur()
    cy.get('input').should('have.value', '123')
  })

  it('maintains input value during typing before blur', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('4.')
    cy.get('input').should('have.value', '4.')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '4.')
  })

  it('handles replacing decimal value correctly', () => {
    cy.mount(<TestComponent />)
    cy.get('input').click().type('0.4').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '0.4')

    cy.get('input').click().type('.5').blur()
    cy.get('[data-testid="state-value"]').should('have.text', '0.5')
  })

  it('changing the amount of zeros in the decimal should not cause rounding to just 0', () => {
    cy.mount(<TestComponent />)

    const action = [
      ['0', '0'],
      ['.', '0.'],
      ['0', '0.0'],
      ['0', '0.00'],
      ['0', '0.000'],
      ['1', '0.0001'],
      ['{backspace}', '0.000'],
      ['2', '0.0002'],
    ]

    // Type "0.0001" and then modify to "0.0002" character by character
    for (const [character, expectedTempValue] of action) {
      cy.get('input').type(character)
      cy.get('[data-testid="state-temp-value"]').should('have.text', expectedTempValue)
    }
  })

  it('applies formatting when provided and toggles raw value on focus', () => {
    const formatWithAbbreviation: NonNullable<NumericTextFieldProps['format']> = (value) =>
      value == null ? '' : formatNumber(Number(value), { abbreviate: true })

    cy.mount(<TestComponent initialValue="1000" format={formatWithAbbreviation} />)

    cy.get('input').should('have.value', '1k')
    cy.get('input').focus().should('have.value', '1000')
    cy.get('input').click().clear().type('5000')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '5000')
    cy.get('[data-testid="state-value"]').should('have.text', '1000')

    cy.get('input').blur()
    cy.get('input').should('have.value', '5k')
    cy.get('[data-testid="state-value"]').should('have.text', '5000')
    cy.get('[data-testid="state-temp-value"]').should('have.text', '5000')
  })
})
