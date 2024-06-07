import createLoanSettings from '@/fixtures/create-loan-settings.json'
import markets from '@/fixtures/markets.json'
import tokens from '@/fixtures/tokens.json'
import testIds from '@/fixtures/testIds.json'

const CHAIN = 'mainnet'
const MARKET_ID = 'WBTC-crvUSD'

describe(`Lend ${MARKET_ID} ${CHAIN} market`, () => {
  const market = markets[CHAIN][MARKET_ID]
  const settings = createLoanSettings[CHAIN][MARKET_ID]
  const userCollateralToken = tokens[CHAIN][market.userCollateral]

  beforeEach(() => {
    // prepare wallet
    cy.createJsonRpcProvider()
      .as('jsonRpcProvider', { type: 'static' })
      .createRandomWallet('1', [{ symbol: userCollateralToken.symbol, amount: settings.userCollateralTokenToAllocate }])
      .as('wallet', { type: 'static' })
      .prepareMetamaskWallet()

    // prepare page
    cy.intercept('GET', 'https://api.curve.fi/api/**').as('getAPI')
    cy.visit(market.createLeverageUrl)
    cy.wait('@getAPI').its('response.statusCode').should('equal', 200)

    // connect metamask
    cy.get('@wallet').connectMetamask()

    // create loan
    cy.createLeverageLoanFlow(settings, '1000')

    cy.visit(market.manageLoanUrl)
  })

  // if test fail due to estimate gas error, try restarting node first.
  it('Repay leverage loan', () => {
    cy.intercept('GET', 'https://prices.curve.fi/1inch/swap/**').as('getPricesAPI2')
    // navigate to repay form
    cy.dataTestId(testIds.radioInpLoanDecrease).as('radioInpRepay').click({ force: true })

    cy.dataTestId(testIds.btnApproval).should('be.disabled')
    cy.dataTestId(testIds.btnRepay).should('be.disabled')

    cy.dataTestId(testIds.inpStateCollateralAmt).type('0.005')
    cy.repayLoan()
  })
})
