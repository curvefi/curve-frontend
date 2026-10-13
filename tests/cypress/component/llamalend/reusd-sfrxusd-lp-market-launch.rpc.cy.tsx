import { BigNumber } from 'bignumber.js'
import { checkCurrentDebt } from '@cy/support/helpers/llamalend/action-info.helpers'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  touchBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/llamalend/borrow-more.helpers'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  waitUntilLendMarketUpdated,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase, type LlammalendTestCaseProps } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import {
  checkFullRepayDetailsLoaded,
  checkLoanClosedWithCollateralReturned,
  createTestAccount,
  executeActivationVote,
  fundBorrower,
  fundLender,
  ONE_DAY_IN_SECONDS,
  REUSD_SFRXUSD_LP_MARKET,
  selectMaxRepayAmount,
} from '@cy/support/helpers/llamalend/market-launch.helpers'
import { setupLlammalendTestCaseMocks } from '@cy/support/helpers/llamalend/mock-market.helpers'
import { selectRepayToken, submitRepayForm } from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkDepositDetailsLoaded,
  submitDepositForm,
  touchDepositForm,
  writeDepositForm,
} from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import { checkCurrentSuppliedAmount } from '@cy/support/helpers/llamalend/supply/supply.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { advanceVirtualNetworkClock } from '@cy/support/helpers/tenderly/vnet-time'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { MarketType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'

const MARKET = REUSD_SFRXUSD_LP_MARKET
/** The market is not whitelisted for leverage, so all forms must work without it */
const NO_LEVERAGE = { leverageEnabled: false, hasLeverage: false, hasLeverageManagement: false }
/** Use the real APIs, like users do on launch day */
const HAS_API = true

describe(`${MARKET.label} launch`, () => {
  skipTestsAfterFailure()

  const { id, chainId, collateral, borrow, borrowMore, supply, borrowedSymbol, borrowedAddress } = MARKET
  const lender = createTestAccount()
  const borrower = createTestAccount()
  const debtAfterBorrowMore = new BigNumber(borrow).plus(borrowMore).toFixed() as Decimal

  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `market-launch-${uuid}`,
    display_name: `MarketLaunch (${uuid})`,
    chain_id: chainId,
    fork_config: { block_number: 'latest' },
  }))

  before(() => {
    const vnet = getVirtualNetwork()
    executeActivationVote({ vnet, market: MARKET })
    advanceVirtualNetworkClock({ vnet, seconds: ONE_DAY_IN_SECONDS })
    fundLender({ vnet, userAddress: lender.address, market: MARKET })
    fundBorrower({ vnet, userAddress: borrower.address, market: MARKET })
  })

  beforeEach(() => setupLlammalendTestCaseMocks({ hasApi: HAS_API }))

  const MarketTestCase = ({
    account,
    ...props
  }: Pick<LlammalendTestCaseProps, 'type' | 'tab'> & { account: typeof lender }) => (
    <LlammalendTestCase
      {...props}
      vnet={getVirtualNetwork()}
      account={account.privateKey}
      userAddress={account.address}
      chainId={chainId}
      marketId={id}
      marketType={MarketType.Lend}
    />
  )

  it('supplies the borrowable liquidity', () => {
    cy.mount(<MarketTestCase account={lender} type="supply" tab="deposit" />)
    writeDepositForm({ amount: supply })
    checkDepositDetailsLoaded({ suppliedAssets: supply, prevSuppliedAssets: '0', hasApi: HAS_API })
    submitDepositForm({})
    touchDepositForm()
    checkCurrentSuppliedAmount(supply)
  })

  it('creates a loan with the LP token as collateral', () => {
    cy.mount(<MarketTestCase account={borrower} type="loan" />)
    writeCreateLoanForm({ collateral, borrow, ...NO_LEVERAGE })
    checkLoanDetailsLoaded({ ...NO_LEVERAGE, hasApi: HAS_API })
    submitCreateLoanForm()
    waitUntilLendMarketUpdated(id, borrow, MarketType.Lend)
  })

  it('borrows more', () => {
    cy.mount(<MarketTestCase account={borrower} type="loan" tab="borrow-more" />)
    writeBorrowMoreForm({ debt: borrowMore, ...NO_LEVERAGE })
    checkBorrowMoreDetailsLoaded({
      expectedCurrentDebt: borrow,
      expectedFutureDebt: debtAfterBorrowMore,
      borrowedSymbol,
      ...NO_LEVERAGE,
      hasApi: HAS_API,
    })
    submitBorrowMoreForm()
    touchBorrowMoreForm() // make sure the new debt is shown
    checkCurrentDebt(debtAfterBorrowMore)
  })

  it('repays the full debt from the wallet', () => {
    cy.mount(<MarketTestCase account={borrower} type="loan" tab="repay" />)
    selectRepayToken({ symbol: borrowedSymbol, tokenAddress: borrowedAddress, ...NO_LEVERAGE })
    selectMaxRepayAmount()
    checkFullRepayDetailsLoaded()
    submitRepayForm()
  })

  it('returns the LP collateral after closing the loan', () => {
    cy.mount(<MarketTestCase account={borrower} type="loan" />)
    checkLoanClosedWithCollateralReturned(collateral)
  })
})
