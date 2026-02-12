import BigNumber from 'bignumber.js'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import { decimal } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_TX_HASH } from './mock-loan-test-data'
import { createMockMintMarket } from './mock-market.helpers'

type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
}

const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

const oneRatePair = () => ({ rate: oneDecimal(0.01, 0.2, 4), future_rate: oneDecimal(0.01, 0.2, 4) })
const oneAprPair = () => ({ rate: oneDecimal(0.01, 0.3, 4), future_rate: oneDecimal(0.01, 0.3, 4) })

const debtAfterAdd = (baseDebt: string, delta: string) => decimal(new BigNumber(baseDebt).plus(delta).decimalPlaces(2))!
const debtAfterSub = (baseDebt: string, delta: string) => decimal(new BigNumber(baseDebt).minus(delta).decimalPlaces(2))!

export const createCreateLoanScenario = ({
  chainId = 1,
  presetRange = 50,
}: { chainId?: number; presetRange?: number } = {}) => {
  const collateral = oneDecimal(0.05, 1.2, 3)
  const borrow = oneDecimal(5, 140, 2)

  const health = oneDecimal(1, 98, 2)
  const minBand = oneInt(8, 30)
  const maxBand = minBand + oneInt(2, 40)
  const lowPrice = oneDecimal(900, 2300, 2)
  const highPrice = decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2))!
  const maxDebt = decimal(new BigNumber(borrow).plus(oneFloat(10, 400)).decimalPlaces(2))!
  const borrowApr = oneAprPair()

  const stubs = {
    createLoanHealth: createStub(health),
    createLoanBands: createStub([minBand, maxBand] as [number, number]),
    createLoanPrices: createStub([highPrice, lowPrice]),
    createLoanMaxRecv: createStub(maxDebt),
    createLoanIsApproved: createStub(true),
    createLoan: createStub(TEST_TX_HASH),
    estimateGasCreateLoan: createStub(`${oneInt(80_000, 220_000)}`),
  } as const

  const market = createMockMintMarket({
    collateral: oneAddress(),
    controller: oneAddress(),
    stats: { parameters: createStub(borrowApr) },
    estimateGas: { createLoan: stubs.estimateGasCreateLoan },
    createLoanHealth: stubs.createLoanHealth,
    createLoanBands: stubs.createLoanBands,
    createLoanPrices: stubs.createLoanPrices,
    createLoanMaxRecv: stubs.createLoanMaxRecv,
    createLoanIsApproved: stubs.createLoanIsApproved,
    createLoan: stubs.createLoan,
  })

  return {
    collateral,
    borrow,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      query: [collateral, borrow, presetRange] as const,
      maxRecv: [collateral, presetRange] as const,
      approved: [collateral] as const,
      submit: [collateral, borrow, presetRange, 0.1] as const,
    },
    stubs,
  }
}

export const createBorrowMoreScenario = ({ chainId = 1 }: { chainId?: number } = {}) => {
  const borrow = oneDecimal(1, 45, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = debtAfterAdd(expectedCurrentDebt, borrow)

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub(oneDecimal(100, 900, 2)),
    borrowMoreIsApproved: createStub(true),
    borrowMoreApprove: createStub(['0xfake']),
    borrowMore: createStub(TEST_TX_HASH),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      borrowMore: stubs.estimateGasBorrowMore,
      borrowMoreApprove: stubs.estimateGasBorrowMoreApprove,
    },
    userState: createStub({ collateral, stablecoin: '0', debt: expectedCurrentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    currentLeverage: createStub(oneDecimal(1, 2, 3)),
    borrowMoreHealth: stubs.borrowMoreHealth,
    borrowMoreMaxRecv: stubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: stubs.borrowMoreIsApproved,
    borrowMoreApprove: stubs.borrowMoreApprove,
    borrowMore: stubs.borrowMore,
  })

  return {
    borrow,
    collateral,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: ['0', '0'] as const,
      maxRecv: ['0'] as const,
      isApproved: ['0'] as const,
      estimateGas: ['0', '0'] as const,
      estimateGasApprove: [] as const,
      submit: ['0', borrow] as const,
    },
    stubs,
  }
}

export const createRepayScenario = ({ chainId = 1 }: { chainId?: number } = {}) => {
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = debtAfterAdd(borrow, oneDecimal(0.5, 50, 2))
  const futureDebt = debtAfterSub(currentDebt, borrow)

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: createStub(true),
    repayApprove: createStub(['0xfake']),
    repay: createStub(TEST_TX_HASH),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      repayApprove: stubs.estimateGasRepayApprove,
    },
    userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    repayHealth: stubs.repayHealth,
    repayPrices: stubs.repayPrices,
    repayIsApproved: stubs.repayIsApproved,
    repayApprove: stubs.repayApprove,
    repay: stubs.repay,
  })

  return {
    borrow,
    collateral,
    currentDebt,
    futureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: [borrow, false] as const,
      prices: [borrow] as const,
      isApproved: [borrow] as const,
      estimateGas: [borrow] as const,
      estimateGasApprove: [] as const,
      submit: [borrow] as const,
    },
    stubs,
  }
}

export const createSoftLiquidationScenario = ({ chainId = 1 }: { chainId?: number } = {}) => {
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.02, 0.6, 3)
  const stateBorrowed = oneDecimal(0.2, 8, 2)
  const debt = debtAfterAdd(borrow, oneDecimal(0.5, 40, 2))
  const debtAfterImprove = decimal(BigNumber.max(new BigNumber(0), new BigNumber(debt).minus(borrow).minus(stateBorrowed)).decimalPlaces(2))!
  const slippage = 0.1

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 240_000)),
    estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
    estimateGasSelfLiquidate: createStub(oneInt(150_000, 280_000)),
    repayHealth: createStub(oneDecimal(30, 98, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: createStub(true),
    repayApprove: createStub(['0xfake']),
    repay: createStub(TEST_TX_HASH),
    selfLiquidateIsApproved: createStub(true),
    selfLiquidateApprove: createStub(['0xfake']),
    selfLiquidate: createStub(TEST_TX_HASH),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      repayApprove: stubs.estimateGasRepayApprove,
      selfLiquidate: stubs.estimateGasSelfLiquidate,
    },
    wallet: {
      balances: createStub({ stablecoin: oneDecimal(5, 25, 2), collateral: oneDecimal(0.02, 0.5, 3) }),
    },
    userState: createStub({ collateral, stablecoin: stateBorrowed, debt }),
    userHealth: createStub(oneDecimal(20, 70, 2)),
    repayHealth: stubs.repayHealth,
    repayPrices: stubs.repayPrices,
    repayIsApproved: stubs.repayIsApproved,
    repayApprove: stubs.repayApprove,
    repay: stubs.repay,
    selfLiquidateIsApproved: stubs.selfLiquidateIsApproved,
    selfLiquidateApprove: stubs.selfLiquidateApprove,
    selfLiquidate: stubs.selfLiquidate,
  })

  return {
    borrow,
    collateral,
    debt,
    debtAfterImprove,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      improveHealth: {
        health: [borrow, false] as const,
        prices: [borrow] as const,
        isApproved: [borrow] as const,
        estimateGas: [borrow] as const,
        estimateGasApprove: [] as const,
        submit: [borrow] as const,
      },
      closePosition: {
        isApproved: [] as const,
        estimateGas: [slippage] as const,
        submit: [slippage] as const,
      },
    },
    stubs,
  }
}
