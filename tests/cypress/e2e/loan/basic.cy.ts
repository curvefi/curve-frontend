import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { shouldLoadMintBorrowDetails } from '@cy/support/helpers/llamalend/market-details.helpers'
import { LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'

const MINT_MARKET = 'WBTC'

const [WIDTH, HEIGHT, BREAKPOINT] = oneViewport()

describe('Basic Access Test', () => {
  beforeEach(() => {
    mockMerklCampaigns()
    cy.viewport(WIDTH, HEIGHT)
  })

  it('should open the crvUSD DApp successfully', () => {
    cy.visit('/crvusd')
    cy.title(LOAD_TIMEOUT).should('include', 'Markets')
  })

  it(`should redirect from the old URL successfully`, () => {
    cy.visit(`/crvusd/#/ethereum/scrvUSD`)
    cy.title(LOAD_TIMEOUT).should('equal', 'Savings crvUSD - Curve')
    cy.url().should('match', /http:\/\/localhost:\d+\/crvusd\/ethereum\/scrvUSD\/?$/)
  })

  it('should load mint market details with a wallet', () => {
    cy.visit(`/crvusd/ethereum/markets/${MINT_MARKET}`)
    shouldLoadMintBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: true })
  })

  it('should load mint market details without a wallet', () => {
    cy.visitWithoutTestConnector(`crvusd/ethereum/markets/${MINT_MARKET}`)
    shouldLoadMintBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: false })
  })
})
