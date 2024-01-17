/// <reference types="cypress" />

describe('swap', () => {
  beforeEach(() => {
    cy.connectWallet()
  })

  it('Should update swap inputs', () => {
    // test select from token
    cy.dataTestid('btn-from-token').click()
    cy.dataTestid('inp-search-from-token').should('exist')
    cy.dataTestid('inp-search-from-token').type('DAI')
    cy.dataTestid('list-from-token').dataTestid('li-from-token').first().should('have.text', 'DAI').click()
    cy.dataTestid('label-from-token').should('have.text', 'DAI')

    // test swap button
    cy.dataTestid('btn-swap-tokens').click()
    cy.dataTestid('label-to-token').should('have.text', 'DAI')

    // test steps
    cy.dataTestid('inp-label-description-from-amount').then(($label) => {
      const fromWalletBalance = $label.text() || '0'
      cy.dataTestid('inp-from-amount').then(($inp) => {
        const fromInpAmount = $inp.val()
        cy.log(`fromWalletBalance ${fromWalletBalance}, fromInpAmount ${fromInpAmount}`)
        const isDisabled = isNaN(fromWalletBalance) ? true : +fromInpAmount > +fromWalletBalance
        cy.dataTestid('btn-approval').should(isDisabled ? 'be.disabled' : 'not.be.disabled')
      })
    })

    // test slippage tolerance update
    cy.dataTestid('btn-open-modal-slippage-tolerance').click()
    cy.dataTestid('modal-slippage-tolerance').should('be.visible')
    cy.dataTestid('inp-slippage-tolerance-custom-slippage').clear().type('0.7', { force: true, delay: 700 })
    cy.dataTestid('btn-slippage-tolerance-save').click()
    cy.dataTestid('btn-open-modal-slippage-tolerance').then(($btn) => {
      expect($btn.text()).contains('.7%')
    })
  })
})
