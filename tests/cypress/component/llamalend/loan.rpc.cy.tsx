/* eslint-disable @typescript-eslint/no-unused-expressions */
import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  touchBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/borrow-more.helpers'
import { checkCurrentDebt, checkDebt } from '@cy/support/helpers/llamalend/action-info.helpers'
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
import { recordValues } from '@curvefi/primitives/objects.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import type { Decimal } from '@ui-kit/utils'

const testCases = recordValues(LlamaMarketType).map((marketType) => oneLoanTestMarket(marketType))

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

      let onSuccess: ReturnType<typeof cy.stub>
      let onPricesUpdated: ReturnType<typeof cy.stub>

      beforeEach(() => {
        onSuccess = cy.stub().as('onSuccess')
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
          onSuccess={onSuccess}
          onPricesUpdated={onPricesUpdated}
        />
      )

      const expectCallbacks = () => {
        expect(onSuccess).to.be.calledOnce
        expect(onPricesUpdated).to.be.called
      }

      it(`creates the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        writeCreateLoanForm({ collateral, borrow, leverageEnabled })
        checkLoanDetailsLoaded({ leverageEnabled })
        submitCreateLoanForm().then(expectCallbacks)
      })

      it(`borrows more`, () => {
        cy.mount(<LoanTestWrapper tab="borrow-more" />)
        writeBorrowMoreForm({ debt: borrowMore })
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt: borrow,
          expectedFutureDebt: debtAfterBorrowMore,
          leverageEnabled,
        })
        submitBorrowMoreForm().then(expectCallbacks)
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
        submitRepayForm().then(expectCallbacks)
        touchRepayLoanForm() // make sure the new debt is shown
        checkDebt({ current: debtAfterRepay, future: debtAfterRepay, symbol: debtTokenSymbol })
      })

      it(`increases health`, () => {
        cy.mount(<LoanTestWrapper tab="improve-health" />)
        writeImproveHealthForm({ amount: improveHealth })
        checkRepayDetailsLoaded({
          debt: { current: debtAfterRepay, future: debtAfterImproveHealth, symbol: debtTokenSymbol },
        })
        submitImproveHealthForm().then(expectCallbacks)
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
        checkDebt({ current: debtAfterImproveHealth, future: '0', symbol: debtTokenSymbol })
        submitClosePositionForm('error', 'Transaction failed').then(() => {
          // unfortunately cannot cause soft liquidation in the tests yet
          cy.get('[data-testid="loan-form-error"]', LOAD_TIMEOUT).contains('not in liquidation mode')
          expect(onSuccess).to.not.be.called
        })
      })
    })
  },
)
