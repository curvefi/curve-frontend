import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { shouldLoadMintBorrowDetails } from '@cy/support/helpers/llamalend/market-details.helpers'
import { blockUnmockedLlamaMarketApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import { LOAD_TIMEOUT } from '@cy/support/ui'

const MINT_MARKET = 'WBTC'

describe('Mint app', () => {
  beforeEach(() => mockMerklCampaigns())

  it('should open', () => {
    cy.visit('/crvusd')
    cy.title(LOAD_TIMEOUT).should('include', 'Markets')
  })

  it('should redirect from the old root URL', () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/crvusd\/ethereum\/scrvUSD\/?$/)
  })

  describe('lend market details', () => {
    const url = `/crvusd/ethereum/markets/${MINT_MARKET}`
    it('with a wallet', () => {
      cy.visit(url)
      shouldLoadMintBorrowDetails({ hasWallet: true })
    })
    it('without a wallet', () => {
      cy.visitWithoutTestConnector(url)
      shouldLoadMintBorrowDetails({ hasWallet: false })
    })
    it('when API is offline', () => {
      blockUnmockedLlamaMarketApis()
      cy.visit(url)
      shouldLoadMintBorrowDetails({ hasWallet: true, hasApi: false })
    })
  })
})
