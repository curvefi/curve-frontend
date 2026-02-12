import { zeroAddress } from 'viem'
import { LoanPreset, PRESET_RANGES } from '@/llamalend/constants'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { oneAddress, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@ui-kit/utils'
import { TEST_TX_HASH } from './mock-loan-test-data'

const toDecimal = (value: number, decimals = 2) =>
  value.toFixed(decimals).replace(/(?:\.0+|(\.\d+?)0+)$/, '$1') as Decimal
const stub = <T>(value: T): unknown => cy.stub().resolves(value)

export const createCreateLoanScenario = () => {
  const collateral = toDecimal(oneFloat(0.05, 1.2), 3)
  const borrow = toDecimal(oneFloat(5, 140), 2)
  const health = toDecimal(oneFloat(1, 98), 2)
  const minBand = oneInt(8, 30)
  const maxBand = minBand + oneInt(2, 40)
  const lowPrice = toDecimal(oneFloat(900, 2300), 2)
  const highPrice = toDecimal(+lowPrice + oneFloat(40, 800), 2)
  const maxDebt = toDecimal(+borrow + oneFloat(10, 400), 2)
  const borrowApr = toDecimal(oneFloat(0.01, 0.3), 4)
  const borrowAprFuture = toDecimal(+borrowApr + oneFloat(-0.02, 0.03), 4)
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

  // This keeps runtime behavior compatible with production checks that rely on `instanceof MintMarketTemplate`.

  return {
    market: Object.assign(Object.create(MintMarketTemplate.prototype), {
      id: 'wsteth',
      collateralSymbol: 'wstETH',
      collateral: oneAddress(),
      collateralDecimals: 18,
      controller: oneAddress(),
      leverageZap: zeroAddress,
      deleverageZap: zeroAddress,
      leverageV2: { hasLeverage: () => false },
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
