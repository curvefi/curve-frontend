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
  approved = true,
}: { chainId?: number; presetRange?: number; approved?: boolean } = {}) => {
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
    createLoanIsApproved: approved
      ? createStub(true)
      : (cy.stub().onFirstCall().resolves(false).resolves(true) as TestStub<readonly [string], boolean>),
    estimateGasCreateLoan: createStub(`${oneInt(80_000, 220_000)}`),
    createLoan: createStub(TEST_TX_HASH),
    ...((!approved && {
      createLoanApprove: createStub(['0xfake']),
      estimateGasCreateLoanApprove: createStub(`${oneInt(70_000, 200_000)}`),
    }) ||
      {}),
  } as const

  const market = createMockMintMarket({
    collateral: oneAddress(),
    controller: oneAddress(),
    stats: { parameters: createStub(borrowApr) },
    estimateGas: {
      createLoan: stubs.estimateGasCreateLoan,
      ...((!approved && { createLoanApprove: stubs.estimateGasCreateLoanApprove }) || {}),
    },
    createLoanHealth: stubs.createLoanHealth,
    createLoanBands: stubs.createLoanBands,
    createLoanPrices: stubs.createLoanPrices,
    createLoanMaxRecv: stubs.createLoanMaxRecv,
    createLoanIsApproved: stubs.createLoanIsApproved,
    ...((!approved && { createLoanApprove: stubs.createLoanApprove }) || {}),
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
      estimateGasApprove: [collateral] as const,
      approve: [collateral] as const,
      submit: [collateral, borrow, presetRange, 0.1] as const,
    },
    stubs,
  }
}

export const createBorrowMoreScenario = ({
  chainId = 1,
  approved = true,
}: { chainId?: number; approved?: boolean } = {}) => {
  const borrow = oneDecimal(1, 45, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const userBorrowed = oneDecimal(0.5, 25, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = debtAfterAdd(expectedCurrentDebt, borrow)

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub({
      maxDebt: oneDecimal(100, 900, 2),
      maxTotalCollateral: oneDecimal(0.5, 5, 3),
      userCollateral: collateral,
      collateralFromUserBorrowed: oneDecimal(0.1, 2, 3),
      collateralFromMaxDebt: oneDecimal(0.2, 4, 3),
      avgPrice: oneDecimal(1000, 3000, 2),
    }),
    borrowMoreExpectedCollateral: createStub({
      totalCollateral: oneDecimal(0.5, 5, 3),
      userCollateral: collateral,
      collateralFromUserBorrowed: oneDecimal(0.1, 2, 3),
      collateralFromDebt: oneDecimal(0.2, 4, 3),
      avgPrice: oneDecimal(1000, 3000, 2),
    }),
    borrowMoreIsApproved: approved
      ? createStub(true)
      : (cy.stub().onFirstCall().resolves(false).resolves(true) as TestStub<readonly [string, string], boolean>),
    borrowMore: createStub(TEST_TX_HASH),
    ...((!approved && {
      estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
      borrowMoreApprove: createStub(['0xfake']),
    }) ||
      {}),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    userState: createStub({ collateral, stablecoin: '0', debt: expectedCurrentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    currentLeverage: createStub(oneDecimal(1, 2, 3)),
    leverageV2: {
      hasLeverage: () => true,
      estimateGas: {
        borrowMore: stubs.estimateGasBorrowMore,
        ...((!approved && { borrowMoreApprove: stubs.estimateGasBorrowMoreApprove }) || {}),
      },
      borrowMoreHealth: stubs.borrowMoreHealth,
      borrowMoreMaxRecv: stubs.borrowMoreMaxRecv,
      borrowMoreExpectedCollateral: stubs.borrowMoreExpectedCollateral,
      borrowMoreIsApproved: stubs.borrowMoreIsApproved,
      ...((!approved && { borrowMoreApprove: stubs.borrowMoreApprove }) || {}),
      borrowMore: stubs.borrowMore,
    },
  })

  return {
    borrow,
    collateral,
    userBorrowed,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: [collateral, userBorrowed, '0'] as const,
      maxRecv: [collateral, userBorrowed] as const,
      isApproved: [collateral, userBorrowed] as const,
      estimateGasApprove: [collateral, userBorrowed] as const,
      approve: [collateral, userBorrowed] as const,
      estimateGas: [collateral, userBorrowed, borrow, 0.1] as const,
      submit: [collateral, userBorrowed, borrow, 0.1] as const,
    },
    stubs,
  }
}

export const createRepayScenario = ({
  chainId = 1,
  approved = true,
}: { chainId?: number; approved?: boolean } = {}) => {
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = debtAfterAdd(borrow, oneDecimal(0.5, 50, 2))
  const futureDebt = debtAfterSub(currentDebt, borrow)

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved
      ? createStub(true)
      : (cy.stub().onFirstCall().resolves(false).resolves(true) as TestStub<readonly [string], boolean>),
    repay: createStub(TEST_TX_HASH),
    ...((!approved && {
      estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
      repayApprove: createStub(['0xfake']),
    }) ||
      {}),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      ...((!approved && { repayApprove: stubs.estimateGasRepayApprove }) || {}),
    },
    userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    repayHealth: stubs.repayHealth,
    repayPrices: stubs.repayPrices,
    repayIsApproved: stubs.repayIsApproved,
    ...((!approved && { repayApprove: stubs.repayApprove }) || {}),
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
      estimateGasApprove: [borrow] as const,
      approve: [borrow] as const,
      submit: [borrow] as const,
    },
    stubs,
  }
}

export const createSoftLiquidationScenario = ({
  chainId = 1,
  approved = true,
}: { chainId?: number; approved?: boolean } = {}) => {
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.02, 0.6, 3)
  const stateBorrowed = oneDecimal(0.2, 8, 2)
  const debt = debtAfterAdd(borrow, oneDecimal(0.5, 40, 2))
  const debtAfterImprove = decimal(BigNumber.max(new BigNumber(0), new BigNumber(debt).minus(borrow).minus(stateBorrowed)).decimalPlaces(2))!
  const slippage = 0.1

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 240_000)),
    estimateGasSelfLiquidate: createStub(oneInt(150_000, 280_000)),
    repayHealth: createStub(oneDecimal(30, 98, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved
      ? createStub(true)
      : (cy.stub().onFirstCall().resolves(false).resolves(true) as TestStub<readonly [string], boolean>),
    repay: createStub(TEST_TX_HASH),
    selfLiquidateIsApproved: approved
      ? createStub(true)
      : (cy.stub().onFirstCall().resolves(false).resolves(true) as TestStub<readonly [], boolean>),
    selfLiquidate: createStub(TEST_TX_HASH),
    ...((!approved && {
      estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
      repayApprove: createStub(['0xfake']),
      selfLiquidateApprove: createStub(['0xfake']),
    }) ||
      {}),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      selfLiquidate: stubs.estimateGasSelfLiquidate,
      ...((!approved && { repayApprove: stubs.estimateGasRepayApprove }) || {}),
    },
    wallet: {
      balances: createStub({ stablecoin: oneDecimal(5, 25, 2), collateral: oneDecimal(0.02, 0.5, 3) }),
    },
    userState: createStub({ collateral, stablecoin: stateBorrowed, debt }),
    userHealth: createStub(oneDecimal(20, 70, 2)),
    repayHealth: stubs.repayHealth,
    repayPrices: stubs.repayPrices,
    repayIsApproved: stubs.repayIsApproved,
    ...((!approved && { repayApprove: stubs.repayApprove }) || {}),
    repay: stubs.repay,
    selfLiquidateIsApproved: stubs.selfLiquidateIsApproved,
    ...((!approved && { selfLiquidateApprove: stubs.selfLiquidateApprove }) || {}),
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
        estimateGasApprove: [borrow] as const,
        approve: [borrow] as const,
        submit: [borrow] as const,
      },
      closePosition: {
        isApproved: [] as const,
        estimateGas: [slippage] as const,
        approve: [] as const,
        submit: [slippage] as const,
      },
    },
    stubs,
  }
}
