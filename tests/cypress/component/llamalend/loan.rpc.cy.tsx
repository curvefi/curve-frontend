import { BigNumber } from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { oneBool } from '@cy/support/generators'
import { checkCurrentDebt, checkDebt } from '@cy/support/helpers/llamalend/action-info.helpers'
import { setupLlv2BorrowingLiquidity } from '@cy/support/helpers/llamalend/borrow-cap.helpers'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  touchBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import {
  checkLeverageCheckbox,
  checkLoanDetailsLoaded,
  CREATE_LOAN_FUND_AMOUNT,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  touchRepayLoanForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { recordValues } from '@primitives/objects.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { LlamaMarketType } from '@ui-kit/types/market'
import { waitFor } from '@ui-kit/utils/time.utils'

const testCases = recordValues(LlamaMarketType).map(marketType => oneLoanTestMarket(marketType))

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
    borrowedAddress,
    borrowedDecimals,
    borrowedSymbol,
    controllerAddress,
    collateral,
    borrow,
    borrowMore,
    repay,
    chainId,
    label,
    marketType,
    hasLeverage,
    hasLeverageManagement,
  }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const hasApi = oneBool() // tests must work with or without api access
      const debtAfterBorrowMore = new BigNumber(borrow).plus(borrowMore).toFixed() as Decimal
      const debtAfterRepay = new BigNumber(debtAfterBorrowMore).minus(repay).toFixed() as Decimal

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet(uuid => ({
        slug: `loan-integration-${uuid}`,
        display_name: `LoanIntegration (${uuid})`,
        chain_id: chainId,
        fork_config: { block_number: 'latest' },
      }))

      /**
       * Leverage disabled in the tests for now because it depends on Odos routes.
       * It will soon be migrated to our own router API, so it will be easier to mock.
       */
      const leverageEnabled = hasLeverage && false
      let adminRpcUrl: string

      let onPricesUpdated: ReturnType<typeof cy.stub>

      before(() => {
        const vnet = getVirtualNetwork()
        const { adminRpcUrl: nextAdminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)
        adminRpcUrl = nextAdminRpcUrl
        setupLlv2BorrowingLiquidity({
          adminRpcUrl,
          publicRpcUrl,
          chainId,
          controllerAddress,
          borrowedAddress,
          borrowedDecimals,
        })
      })

      beforeEach(() => {
        onPricesUpdated = cy.stub().as('onPricesUpdated')
        const vnet = getVirtualNetwork()
        adminRpcUrl = getRpcUrls(vnet).adminRpcUrl
        fundEth({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, recipientAddresses: [address] })
        fundErc20({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, tokenAddress, recipientAddresses: [address] })
        cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)

        if (!hasApi) blockUnmockedApis()
      })

      const LoanTestWrapper = ({ tab }: Pick<LlammalendTestCaseProps, 'tab'>) => (
        <LlammalendTestCase
          type="loan"
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={privateKey}
          chainId={chainId}
          marketId={id}
          userAddress={address}
          onPricesUpdated={onPricesUpdated}
          marketType={marketType}
        />
      )

      it(`creates the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage })
        checkLoanDetailsLoaded({ leverageEnabled, hasApi })
        submitCreateLoanForm().then(() => expect(onPricesUpdated).to.be.called)
        waitUntilLendMarketUpdated(id, borrow, marketType)
      })

      it(`borrows more`, () => {
        cy.mount(<LoanTestWrapper tab="borrow-more" />)
        writeBorrowMoreForm({ debt: borrowMore, leverageEnabled, hasLeverageManagement }) // todo: implement add collateral in some markets
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt: borrow,
          expectedFutureDebt: debtAfterBorrowMore,
          leverageEnabled,
          borrowedSymbol,
          hasApi,
        })
        submitBorrowMoreForm().then(() => expect(onPricesUpdated).to.be.called)
        touchBorrowMoreForm() // make sure the new debt is shown
        checkCurrentDebt(debtAfterBorrowMore)
        checkLeverageCheckbox({ leverageEnabled, hasLeverage: hasLeverageManagement })
      })

      it(`repays the loan`, () => {
        cy.mount(<LoanTestWrapper tab="repay" />)
        selectRepayToken({ symbol: borrowedSymbol, tokenAddress: borrowedAddress, hasLeverageManagement })
        writeRepayLoanForm({ amount: repay })
        checkRepayDetailsLoaded({
          debt: { current: debtAfterBorrowMore, future: debtAfterRepay, symbol: borrowedSymbol },
          leverageEnabled,
          hasApi,
        })
        submitRepayForm().then(() => expect(onPricesUpdated).to.be.called)
        touchRepayLoanForm() // make sure the new debt is shown
        checkDebt({ current: debtAfterRepay, future: debtAfterRepay, symbol: borrowedSymbol })
      })
    })
  },
)
