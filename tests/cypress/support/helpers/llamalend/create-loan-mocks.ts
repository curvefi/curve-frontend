import BigNumber from 'bignumber.js'
import { LoanPreset, PRESET_RANGES } from '@/llamalend/constants'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { decimal } from '@ui-kit/utils'
import { TEST_TX_HASH } from './mock-loan-test-data'
import { createMockMintMarket } from './mock-market.helpers'

const stub = <T>(value: T): unknown => cy.stub().resolves(value)

export const createCreateLoanScenario = () => {
  const collateral = oneDecimal(0.05, 1.2, 3)
  const borrow = oneDecimal(5, 140, 2)
  const health = oneDecimal(1, 98, 2)
  const minBand = oneInt(8, 30)
  const maxBand = minBand + oneInt(2, 40)
  const lowPrice = oneDecimal(900, 2300, 2)
  const highPrice = decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2).toString())!
  const maxDebt = decimal(new BigNumber(borrow).plus(oneFloat(10, 400)).decimalPlaces(2).toString())!
  const borrowApr = oneDecimal(0.01, 0.3, 4)
  const borrowAprFuture = decimal(new BigNumber(borrowApr).plus(oneFloat(-0.02, 0.03)).decimalPlaces(4).toString())!
  const gas = `${oneInt(80_000, 220_000)}`
  const range = PRESET_RANGES[LoanPreset.Safe]
  const slippage = 0.1

  const createLoanHealth = stub(health)
  const createLoanBands = stub([minBand, maxBand] as [number, number])
  const createLoanPrices = stub([highPrice, lowPrice] as [Decimal, Decimal])
  const createLoanMaxRecv = stub(maxDebt)
  const createLoanIsApproved = stub(true)
  const createLoan = stub(TEST_TX_HASH)
  const estimateGasCreateLoan = stub(gas)
  const marketParams = stub({ rate: borrowApr, future_rate: borrowAprFuture })

  return {
    market: createMockMintMarket({
      collateral: oneAddress(),
      controller: oneAddress(),
      stats: { parameters: marketParams },
      estimateGas: { createLoan: estimateGasCreateLoan },
      createLoanHealth,
      createLoanBands,
      createLoanPrices,
      createLoanMaxRecv,
      createLoanIsApproved,
      createLoan,
    }) as MintMarketTemplate,
    stubs: {
      createLoanHealth,
      createLoanBands,
      createLoanPrices,
      createLoanMaxRecv,
      createLoanIsApproved,
      createLoan,
      estimateGasCreateLoan,
      marketParams,
    },
    form: { collateral, borrow, leverageEnabled: false as const },
    expected: {
      range,
      slippage,
      queryDebtArgs: [collateral, borrow, range] as const,
      maxRecvArgs: [collateral, range] as const,
      approvedArgs: [collateral] as const,
      submitArgs: [collateral, borrow, range, slippage] as const,
    },
  }
}
