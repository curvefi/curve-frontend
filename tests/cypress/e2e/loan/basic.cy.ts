import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import { shouldLoadMintBorrowDetails } from '@cy/support/helpers/llamalend/market-details.helpers'
import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import { mockLlamalendChartApis } from '@cy/support/helpers/llamalend/mocks/llamalend-chart.mocks'
import { LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'

const MINT_MARKET = 'WBTC'

const [WIDTH, HEIGHT, BREAKPOINT] = oneViewport()

describe('Mint app', () => {
  beforeEach(() => {
    mockMerklCampaigns()
    mockLlamalendChartApis()
    cy.viewport(WIDTH, HEIGHT)
  })

  it('should open', () => {
    cy.visit('/crvusd')
    cy.title(LOAD_TIMEOUT).should('include', 'Markets')
  })

  describe('lend market details', () => {
    const url = `/crvusd/ethereum/markets/${MINT_MARKET}`
    it('with a wallet', () => {
      cy.visit(url)
      shouldLoadMintBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: true })
    })
    it('without a wallet', () => {
      cy.visitWithoutTestConnector(url)
      shouldLoadMintBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: false })
    })
    it('when API is offline', () => {
      blockUnmockedApis()
      cy.visit(url)
      shouldLoadMintBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: true, hasApi: false })
    })
  })
})
