import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { HelperMessage } from '@ui-kit/shared/ui/LargeTokenInput/HelperMessage'

type ExpectedMatch = {
  raw: string
  text: string
}

type TestCase = {
  name: string
  message: string
  expectedMatches: ExpectedMatch[]
}

const testCases: TestCase[] = [
  {
    name: 'matches standalone negative and fractional values',
    message: 'Insufficient balance: available -12.5, required 3.75.',
    expectedMatches: [
      { raw: '-12.5', text: '-12.50' },
      { raw: '3.75', text: '3.75' },
    ],
  },
  {
    name: 'ignores alphanumeric words',
    message: 'Invalid values foo123bar and nonce42 in payload.',
    expectedMatches: [],
  },
  {
    name: 'ignores numeric fragments inside ethereum addresses',
    message: 'Transfer to 0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 failed: available 12.5, required 15.',
    expectedMatches: [
      { raw: '12.5', text: '12.50' },
      { raw: '15', text: '15' },
    ],
  },
  {
    name: 'renders abbreviations for large standalone values',
    message: 'Insufficient balance: available 123456, required 2500000.',
    expectedMatches: [
      { raw: '123456', text: '123.46k' },
      { raw: '2500000', text: '2.50m' },
    ],
  },
]

describe('HelperMessage', () => {
  testCases.forEach(({ name, message, expectedMatches }) => {
    it(name, () => {
      const onNumberClick = cy.stub()

      cy.mount(
        <ComponentTestWrapper>
          <HelperMessage isError message={message} onNumberClick={onNumberClick} />
        </ComponentTestWrapper>,
        undefined,
        name,
      )

      cy.get('[data-testid^="helper-message-number-"]').should('have.length', expectedMatches.length)

      expectedMatches.forEach(({ raw, text }, index) =>
        cy
          .get(`[data-testid="helper-message-number-${index}"]`)
          .should('have.attr', 'data-value', raw)
          .and('have.text', text)
          .click(),
      )

      cy.then(() => {
        expect(onNumberClick).to.have.callCount(expectedMatches.length)
        expectedMatches.forEach(({ raw }) => {
          expect(onNumberClick).to.have.been.calledWith(raw)
        })
      })
    })
  })
})
