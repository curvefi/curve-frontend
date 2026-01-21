import { LoanPreset } from '@/llamalend/constants'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { oneOf } from '@cy/support/generators'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain, Decimal } from '@ui-kit/utils'
import { LOAD_TIMEOUT } from '../ui'

const chainId = Chain.Ethereum

const CREATE_LOAN_TEST_MARKETS = {
  [LlamaMarketType.Mint]: [
    {
      id: 'lbtc',
      collateralAddress: '0x8236a87084f8b84306f72007f36f2618a5634494', // lbtc
      collateral: '1',
      borrow: '100',
      chainId,
      path: '/crvusd/ethereum/markets/lbtc',
    },
  ],
  [LlamaMarketType.Lend]: [
    {
      id: 'one-way-market-14',
      collateralAddress: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', // USDe
      collateral: '1',
      borrow: '0.9',
      chainId,
      path: '/lend/ethereum/markets/0x74f88Baa966407b50c10B393bBD789639EFfE78B',
    },
  ],
} as const

export const oneLoanTestMarket = (type: LlamaMarketType = oneOf(...recordValues(LlamaMarketType))) =>
  oneOf(...CREATE_LOAN_TEST_MARKETS[type])

const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

/**
 * Check all loan detail values are loaded and valid.
 * The accordion is expected to be opened before calling this function.
 */
export function checkLoanDetailsLoaded({ leverageEnabled }: { leverageEnabled: boolean }) {
  getActionValue('borrow-band-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) to (-?\d(\.\d+)?)/)
  getActionValue('borrow-price-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').contains('%')
  getActionValue('borrow-apr-previous').contains('%')
  getActionValue('borrow-ltv').contains('%')
  getActionValue('borrow-n').contains('50')

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').contains('%')
    getActionValue('borrow-slippage').contains('%')
  } else {
    getActionValue('borrow-price-impact').should('not.exist')
    getActionValue('borrow-slippage').should('not.exist')
  }

  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

/**
 * Fill in the create loan form. Assumes the form is already opened.
 */
export function writeCreateLoanForm({
  collateral,
  borrow,
  leverageEnabled,
}: {
  collateral: Decimal
  borrow: Decimal
  leverageEnabled: boolean
}) {
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')
  cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type(collateral)
  cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
  getActionValue('borrow-health').should('have.text', '∞')
  cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type(borrow)
  getActionValue('borrow-health').should('not.contain.text', '∞')
  cy.contains('button', 'Health').click() // open the accordion

  if (leverageEnabled) {
    cy.get('[data-testid="leverage-checkbox"]').click()
  }
}

/**
 * Test the loan range slider by selecting max ltv and max borrow presets, checking for errors, and clearing them.
 */
export function checkLoanRangeSlider(leverageEnabled: boolean) {
  cy.get(`[data-testid="loan-preset-${LoanPreset.MaxLtv}"]`).click()
  cy.get('[data-testid="borrow-set-debt-to-max"]').should('not.exist') // should only render after loaded
  cy.get('[data-testid="borrow-set-debt-to-max"]', LOAD_TIMEOUT).click()
  cy.get(`[data-testid="loan-preset-${LoanPreset.Safe}"]`).click({ force: true }) // force because sometimes a tooltip covers it
  cy.get('[data-testid="helper-message-error"]', LOAD_TIMEOUT).should('contain.text', 'debt exceeds the maximum')
  cy.get('[data-testid="borrow-set-debt-to-max"]').click() // set max again to fix error
  cy.get('[data-testid="helper-message-error"]').should('not.exist')
  checkLoanDetailsLoaded({ leverageEnabled })
}

/**
 * Submit the create loan form and wait for the button to be re-enabled.
 */
export function submitCreateLoanForm() {
  cy.get('[data-testid="create-loan-submit-button"]').click()
  return cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT)
}
