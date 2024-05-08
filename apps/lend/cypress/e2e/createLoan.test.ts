import { CRV_TOKEN_ADDRESS } from '../support/tokens'
import { getTokenBalance } from '../support/web3'

describe('Create loan test', () => {
  it('Connect to Metamask', () => {
    cy.visit('/#/ethereum/markets/one-way-market-9/create')

    cy.getByTestId('btn-navigation-connect-wallet').click()
    cy.get('onboard-v2').shadow().find('.wallets-container').children().first().click()
    cy.acceptMetamaskAccess().should('be.true')
  })

  it('Approval spending', () => {
    const collateralAmount = 10
    const borrowAmount = 1
    cy.get('#inpCollateralAmt').type(`${collateralAmount}`)
    cy.get('#inpDebt').type(`${borrowAmount}`)

    cy.getByTestId('btn-approval').click()
    cy.rejectMetamaskPermissionToSpend()
    cy.getByTestId('alert-box').should('be.visible')
    cy.getByTestId('btn-btn-close-alert-box').click()

    cy.getByTestId('btn-approval').click()
    cy.confirmMetamaskPermissionToSpend()
  })

  it('Create loan', () => {
    cy.getMetamaskWalletAddress().then(async (walletAddress) => {
      const crvBalance = await getTokenBalance(CRV_TOKEN_ADDRESS, walletAddress)
      cy.wrap(crvBalance).as('initialCrvBalance')
    })

    cy.getByTestId('btn-create').should('be.enabled').click()
    cy.confirmMetamaskTransaction()
    cy.contains('Manage loan').should('be.visible')

    cy.getMetamaskWalletAddress().then(async (walletAddress) => {
      const crvBalance = await getTokenBalance(CRV_TOKEN_ADDRESS, walletAddress)
      cy.get('@initialCrvBalance').then((initialCrvBalance) => {
        expect(initialCrvBalance - crvBalance).to.eq(collateralAmount)
      })
    })
  })
})
