import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import {
  shouldLoadLendBorrowDetails,
  shouldLoadLendVaultDetails,
} from '@cy/support/helpers/llamalend/market-details.helpers'
import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import { LOAD_TIMEOUT, oneViewport } from '@cy/support/ui'

const LEND_MARKET = '0x23F5a668A9590130940eF55964ead9787976f2CC'

const [WIDTH, HEIGHT, BREAKPOINT] = oneViewport()

describe('Lend app', () => {
  beforeEach(() => {
    mockMerklCampaigns()
    cy.viewport(WIDTH, HEIGHT)
  })

  it('should open', () => {
    cy.visit('/lend/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old root URL', () => {
    cy.visit('/lend/#/ethereum')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old nested URL', () => {
    cy.visit('/lend/#/ethereum/disclaimer?tab=lend')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/lend\/ethereum\/legal\/?\?tab=disclaimers$/)
    cy.title().should('equal', 'Legal - Curve')
  })

  describe('lend market details', () => {
    const url = `/lend/ethereum/markets/${LEND_MARKET}`
    it('with a wallet', () => {
      cy.visit(url)
      shouldLoadLendBorrowDetails({ breakpoint: BREAKPOINT, hasWallet: true })
    })
    it('without a wallet', () => {
      cy.visitWithoutTestConnector(url)
      shouldLoadLendBorrowDetails({ hasWallet: false })
    })
    it('when API is offline', () => {
      blockUnmockedApis()
      cy.visit(url)
      shouldLoadLendBorrowDetails({ hasWallet: true, hasApi: false })
    })
  })

  describe('vault market details', () => {
    const url = `/lend/ethereum/markets/${LEND_MARKET}/vault`
    it('with a wallet', () => {
      cy.visit(url)
      shouldLoadLendVaultDetails({ breakpoint: BREAKPOINT, hasWallet: true })
    })
    it('without a wallet', () => {
      cy.visitWithoutTestConnector(url)
      shouldLoadLendVaultDetails({ breakpoint: BREAKPOINT, hasWallet: false })
    })
    it('when API is offline', () => {
      blockUnmockedApis()
      cy.visit(url)
      shouldLoadLendVaultDetails({ breakpoint: BREAKPOINT, hasWallet: true, hasApi: false })
    })
  })
})
