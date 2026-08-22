import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'

const ERROR_MESSAGE = Array.from({ length: 20 }, (_, index) => `Transaction error detail ${index}`).join(' ')

describe('FormAlerts', () => {
  beforeEach(() => {
    cy.window().then(({ navigator }) => cy.stub(navigator.clipboard, 'writeText').as('writeText'))
    cy.mount(
      <ComponentTestWrapper>
        <FormAlerts error={new Error(ERROR_MESSAGE)} formErrors={[]} handledErrors={[]} />
      </ComponentTestWrapper>,
    )
  })

  it('truncates and copies submission errors', () => {
    cy.get('[data-testid="loan-alert-error-message"]')
      .should('have.css', '-webkit-line-clamp', '5')
      .and('have.css', 'overflow', 'hidden')
    cy.contains('button', 'Submit error report').should('be.visible')
    cy.get('[data-testid="copy-loan-alert-error"]').should('be.visible')
    cy.get('[data-testid="dismiss-loan-alert-error"]').should('be.visible')

    cy.get('[data-testid="copy-loan-alert-error"]').click()
    cy.get('@writeText').should('have.been.calledOnceWith', ERROR_MESSAGE)
    cy.get('[data-testid="copy-confirmation"]').should('not.contain.text', ERROR_MESSAGE)
  })

  it('dismisses submission errors', () => {
    cy.get('[data-testid="dismiss-loan-alert-error"]').click()
    cy.get('[data-testid="loan-alert-error"]').should('not.exist')
  })
})
