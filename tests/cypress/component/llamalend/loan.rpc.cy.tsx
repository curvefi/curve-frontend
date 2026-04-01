/* eslint-disable @typescript-eslint/no-unused-expressions */
import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { checkCurrentDebt, checkDebt } from '@cy/support/helpers/llamalend/action-info.helpers'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  touchBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import {
  checkLoanDetailsLoaded,
  CREATE_LOAN_FUND_AMOUNT,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  touchRepayLoanForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  submitClosePositionForm,
  submitImproveHealthForm,
  touchImproveHealthForm,
  writeImproveHealthForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { recordValues } from '@primitives/objects.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { waitFor } from '@ui-kit/utils/time.utils'

const testCases = recordValues(LlamaMarketType).map((marketType) => ({ marketType, ...oneLoanTestMarket(marketType) }))

/**
 * The lend markets have a memoize() around the userState function that we cannot control from the outside.
 * This leads to the borrow more form detecting maxDebt=0 during the first render. It needs to be recalled once the user state is updated.
 * The proper fix is here: https://github.com/curvefi/curve-llamalend.js/pull/86
 */
const waitUntilLendMarketUpdated = (id: string, expectedDebt: Decimal, marketType: LlamaMarketType) => {
  if (marketType !== LlamaMarketType.Lend) return // mint markets don't have cache
  cy.then(LOAD_TIMEOUT, () =>
    waitFor(async () => {
      const state = await getLib('llamaApi')?.getLendMarket(id).userPosition.userState()
      if (state && BigNumber(expectedDebt).isEqualTo(state.debt)) return true
      console.warn(`Lend market ${id} debt not updated to ${expectedDebt} yet (state=${JSON.stringify(state)})`)
    }, LOAD_TIMEOUT),
  )
}

testCases.forEach(
  ({
    id,
    collateralAddress: tokenAddress,
    collateral,
    borrow,
    borrowMore,
    repay,
    improveHealth,
    chainId,
    hasLeverage,
    label,
    marketType,
  }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const debtAfterBorrowMore = new BigNumber(borrow).plus(borrowMore).toFixed() as Decimal
      const debtAfterRepay = new BigNumber(debtAfterBorrowMore).minus(repay).toFixed() as Decimal
      const debtAfterImproveHealth = new BigNumber(debtAfterRepay).minus(improveHealth).toFixed() as Decimal

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `loan-integration-${uuid}`,
        display_name: `LoanIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))

      /**
       * Leverage disabled in the tests for now because it depends on Odos routes.
       * It will soon be migrated to our own router API, so it will be easier to mock.
       */
      const leverageEnabled = hasLeverage && false
      const debtTokenSymbol = 'crvUSD'
      let adminRpcUrl: string

      let onPricesUpdated: ReturnType<typeof cy.stub>

      beforeEach(() => {
        onPricesUpdated = cy.stub().as('onPricesUpdated')
        const vnet = getVirtualNetwork()
        adminRpcUrl = getRpcUrls(vnet).adminRpcUrl
        fundEth({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, recipientAddresses: [address] })
        fundErc20({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, tokenAddress, recipientAddresses: [address] })
        cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
      })

      const LoanTestWrapper = ({ tab }: Pick<LlammalendTestCaseProps, 'tab'>) => (
        <LlammalendTestCase
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={privateKey}
          chainId={chainId}
          marketId={id}
          userAddress={address}
          onPricesUpdated={onPricesUpdated}
        />
      )

      it(`creates the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        writeCreateLoanForm({ collateral, borrow, leverageEnabled })
        checkLoanDetailsLoaded({ leverageEnabled })
        // we need to pass checkMessage=false because the form is unmounted as soon as the transaction is submitted
        submitCreateLoanForm({ checkMessage: false }).then(() => expect(onPricesUpdated).to.be.called)
        waitUntilLendMarketUpdated(id, borrow, marketType)
      })

      it(`borrows more`, () => {
        cy.mount(<LoanTestWrapper tab="borrow-more" />)
        writeBorrowMoreForm({ debt: borrowMore }) // todo: implement add collateral in some markets
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt: borrow,
          expectedFutureDebt: debtAfterBorrowMore,
          leverageEnabled,
        })
        submitBorrowMoreForm().then(() => expect(onPricesUpdated).to.be.called)
        touchBorrowMoreForm() // make sure the new debt is shown
        checkCurrentDebt(debtAfterBorrowMore)
      })

      it(`repays the loan`, () => {
        cy.mount(<LoanTestWrapper tab="repay" />)
        selectRepayToken({ symbol: debtTokenSymbol, tokenAddress: CRVUSD_ADDRESS, hasLeverage })
        writeRepayLoanForm({ amount: repay })
        checkRepayDetailsLoaded({
          debt: { current: debtAfterBorrowMore, future: debtAfterRepay, symbol: debtTokenSymbol },
          leverageEnabled,
        })
        submitRepayForm().then(() => expect(onPricesUpdated).to.be.called)
        touchRepayLoanForm() // make sure the new debt is shown
        checkDebt({ current: debtAfterRepay, future: debtAfterRepay, symbol: debtTokenSymbol })
      })

      it(`increases health`, () => {
        cy.mount(<LoanTestWrapper tab="improve-health" />)
        writeImproveHealthForm({ amount: improveHealth })
        checkRepayDetailsLoaded({
          debt: { current: debtAfterRepay, future: debtAfterImproveHealth, symbol: debtTokenSymbol },
          isPriceChanged: false,
        })
        submitImproveHealthForm().then(() => expect(onPricesUpdated).not.to.be.called) // no price updates while in soft liquidation
        touchImproveHealthForm() // make sure the new debt is shown
        checkDebt({ current: debtAfterImproveHealth, future: debtAfterImproveHealth, symbol: debtTokenSymbol })
      })

      it(`closes the loan`, () => {
        // extra crvUSD to close the loan due to the safety buffer
        fundErc20({
          adminRpcUrl,
          amountWei: CREATE_LOAN_FUND_AMOUNT,
          tokenAddress: CRVUSD_ADDRESS,
          recipientAddresses: [address],
        })
        cy.mount(<LoanTestWrapper tab="close" />)
        checkClosePositionDetailsLoaded({ debt: debtAfterImproveHealth })
        checkDebt({ current: debtAfterImproveHealth, future: '0', symbol: debtTokenSymbol, hasLtv: false })
        submitClosePositionForm('error').then(() => {
          // unfortunately cannot cause soft liquidation in the tests yet
          cy.get('[data-testid="loan-alert-error"]', LOAD_TIMEOUT).contains('not in liquidation mode')
          expect(onPricesUpdated).not.to.be.called
        })
      })
    })
  },
)
