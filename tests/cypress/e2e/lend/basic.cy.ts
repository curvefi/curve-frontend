import { mockMerklCampaigns } from '@cy/support/helpers/lending-mocks'
import {
  shouldLoadLendBorrowDetails,
  shouldLoadLendVaultDetails,
} from '@cy/support/helpers/llamalend/market-details.helpers'
import { LOAD_TIMEOUT, oneMobileViewport } from '@cy/support/ui'

const LEND_MARKET = '0x23F5a668A9590130940eF55964ead9787976f2CC'

describe('Basic Access Test', () => {
  beforeEach(() => mockMerklCampaigns())

  it('should open the Lend DApp successfully', () => {
    cy.visit('/lend/')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old root URL successfully', () => {
    cy.visit('/lend/#/ethereum')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/llamalend\/ethereum\/markets\/?$/)
  })

  it('should redirect from the old nested URL successfully', () => {
    cy.visit('/lend/#/ethereum/disclaimer?tab=lend')
    cy.url(LOAD_TIMEOUT).should('match', /http:\/\/localhost:\d+\/lend\/ethereum\/legal\/?\?tab=disclaimers$/)
    cy.title().should('equal', 'Legal - Curve')
  })

  it('should load lend market details with a wallet', () => {
    cy.visit(`/lend/ethereum/markets/${LEND_MARKET}${''}`)
    shouldLoadLendBorrowDetails({ hasWallet: true })
  })

  it('should load lend market details form drawer on mobile', () => {
    const [width, height, breakpoint] = oneMobileViewport()
    cy.viewport(width, height)
    cy.visit(`/lend/ethereum/markets/${LEND_MARKET}${''}`)
    shouldLoadLendBorrowDetails({ breakpoint, hasWallet: true })
  })

  it('should load lend vault details with a wallet', () => {
    cy.visit(`/lend/ethereum/markets/${LEND_MARKET}${'/vault'}`)
    shouldLoadLendVaultDetails({ hasWallet: true })
  })

  it('should load lend market details without a wallet', () => {
    cy.visitWithoutTestConnector(`lend/ethereum/markets/${LEND_MARKET}${''}`)
    shouldLoadLendBorrowDetails({ hasWallet: false })
  })

  it('should load lend vault details without a wallet', () => {
    cy.visitWithoutTestConnector(`lend/ethereum/markets/${LEND_MARKET}${'/vault'}`)
    shouldLoadLendVaultDetails({ hasWallet: false })
  })
})
