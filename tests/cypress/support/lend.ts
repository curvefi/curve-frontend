import type { LoanSetting } from '@/fixtures/create-loan-settings.json'

import testIds from '@/fixtures/testIds.json'

export function createSofLiquidationLoan() {
  cy.get('@btnCreate').should('be.enabled').click()
  cy.dataTestId('modal-warning').as('modalWarning').should('be.visible')
  cy.dataTestId('btn-createAnyway').as('btnCreateAnyway').should('be.disabled')

  cy.get('@modalWarning').find('[type="checkbox"]').not('[disabled]').check({ force: true }).should('be.checked')
  cy.get('@btnCreateAnyway').should('be.enabled').click()
  cy.contains('Loan Received').should('be.visible')
}

export function createLeverageLoan() {
  cy.dataTestId(testIds.detailInfoEstGasValue).should('not.contain', '-')

  cy.dataTestId(testIds.btnCreate).should('be.enabled').click()

  cy.dataTestId('detailInfoLabel-priceImpact').then(($el) => {
    const text = $el.text()
    if (text.startsWith('High')) {
      cy.dataTestId(testIds.checkConfirmProceed).click({ force: true })
      cy.dataTestId(testIds.btnCreateAnyway).as('createAnyway').should('not.be.disabled')
      cy.get('@createAnyway').click()
    }
  })

  cy.contains('Loan Received').should('be.visible')
  cy.dataTestId('link-manageLoan').should('be.visible')
}

export function createLeverageLoanFlow(settings: LoanSetting, borrowAmount: string) {
  cy.intercept('GET', 'https://prices.curve.fi/1inch/swap/**').as('getPricesAPI')

  cy.dataTestId(testIds.btnApproval).should('be.disabled')
  cy.dataTestId(testIds.btnCreate).should('be.disabled')

  cy.inputMaxCollateral(settings.userCollateralTokenToAllocate)
  cy.inputBorrow(borrowAmount)

  cy.approveLeverageSpending()
  cy.createLeverageLoan()
}

export function repayLoan() {
  cy.dataTestId(testIds.detailInfoEstGasValue).should('not.contain', '-')
  cy.dataTestId(testIds.btnRepay).should('not.be.disabled')
  cy.dataTestId(testIds.btnRepay).click()
  cy.contains('Repaid').should('be.visible')
}
