import { BigNumber } from 'bignumber.js'
import type { Address } from 'viem'
import { LEVERAGE } from '@/llamalend/constants'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { CRVUSD_ADDRESS, decimal, decimalMinus, decimalSum } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from './mock-loan-test-data'
import { createMockMintMarket } from './mock-market.helpers'
import { seedErc20BalanceForAddresses } from './query-cache.helpers'

/** Seed token balances for both collateral and borrow (crvUSD) tokens so useReadContracts doesn't make real RPC calls */
const seedMarketBalances = (chainId: number, collateralAddress: Address) => {
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: collateralAddress,
    addresses: [TEST_ADDRESS],
    rawBalance: 10n ** 20n,
  })
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: CRVUSD_ADDRESS,
    addresses: [TEST_ADDRESS],
    rawBalance: 10n ** 22n,
  })
}

export type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

// define our own interface so we don't get errors from SinonStub
export type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
  callCount: number
}

export const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

/** Creates an isApproved stub that returns false until approveStub has been called, then returns true. */
export const createIsApprovedStub = (approveStub: TestStub<readonly [string], unknown>) =>
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  cy.stub().callsFake(async () => approveStub.callCount > 0) as TestStub<readonly [string], boolean>

const generateMarketRates = () => ({
  borrowApr: oneDecimal(0.01, 0.3, 4),
  borrowApy: oneDecimal(0.01, 0.3, 4),
  lendApr: oneDecimal(0.01, 0.1, 4),
  lendApy: oneDecimal(0.01, 0.1, 4),
})
const oneRatePair = () => ({
  rate: oneDecimal(0.01, 0.2, 4),
  future_rate: oneDecimal(0.01, 0.2, 4),
  rates: generateMarketRates(),
  future_rates: generateMarketRates(),
})
const oneAprPair = () => ({
  rate: oneDecimal(0.01, 0.3, 4),
  future_rate: oneDecimal(0.01, 0.3, 4),
  rates: generateMarketRates(),
  future_rates: generateMarketRates(),
})

const DEFAULT_LEVERAGE_SLIPPAGE = Number(SLIPPAGE[LEVERAGE].default)
const DEFAULT_USER_BORROWED = '0' as const
/** Default collateral address used in createMockMintMarket */
const DEFAULT_COLLATERAL_ADDRESS = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as const

const leverageMetrics = () => ({
  totalCollateral: oneDecimal(1, 4, 3),
  userCollateral: oneDecimal(0.05, 1.2, 3),
  collateralFromUserBorrowed: oneDecimal(0.01, 0.5, 3),
  collateralFromDebt: oneDecimal(0.01, 0.5, 3),
  leverage: oneDecimal(1.1, 6, 2),
  avgPrice: oneDecimal(900, 2300, 2),
})

const expectedBorrowedMetrics = () => ({
  totalBorrowed: oneDecimal(0.2, 20, 2),
  borrowedFromStateCollateral: oneDecimal(0.01, 0.5, 3),
  borrowedFromUserCollateral: oneDecimal(0.01, 0.5, 3),
  userBorrowed: oneDecimal(0.2, 20, 2),
  avgPrice: oneDecimal(900, 2300, 2),
})

export const createCreateLoanScenario = ({
  chainId,
  presetRange = 50,
  approved,
  leverage = false,
}: {
  chainId: number
  presetRange?: number
  approved: boolean
  leverage?: boolean
}) => {
  const collateral = oneDecimal(0.05, 1.2, 3)
  const borrow = oneDecimal(5, 140, 2)
  const collateralAddress = DEFAULT_COLLATERAL_ADDRESS
  const lowPrice = oneDecimal(900, 2300, 2)
  const createLoanApprove = createStub(TEST_TX_HASH)
  const createLoanLeverageApprove = createStub(TEST_TX_HASH)
  const maxLeverage = oneDecimal(1.5, 10, 2)

  const normalStubs = {
    createLoanHealth: createStub(oneDecimal(1, 98, 2)),
    createLoanPrices: createStub([
      decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2))!,
      lowPrice,
    ]),
    createLoanMaxRecv: createStub(decimal(new BigNumber(borrow).plus(oneFloat(10, 400)).decimalPlaces(2))!),
    createLoanIsApproved: approved ? createStub(true) : createIsApprovedStub(createLoanApprove),
    estimateGasCreateLoan: createStub(`${oneInt(80_000, 220_000)}`),
    createLoan: createStub(TEST_TX_HASH),
    createLoanApprove,
    estimateGasCreateLoanApprove: createStub(`${oneInt(70_000, 200_000)}`),
    createLoanExpectedCollateral: createStub(leverageMetrics()),
    createLoanPriceImpact: createStub(oneDecimal(0.01, 1, 3)),
    maxLeverage: createStub(maxLeverage),
  } as const

  const leverageStubs = {
    createLoanHealth: createStub(oneDecimal(1, 98, 2)),
    createLoanPrices: createStub([
      decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2))!,
      lowPrice,
    ]),
    createLoanMaxRecv: createStub({
      maxDebt: decimal(new BigNumber(borrow).plus(oneFloat(10, 400)).decimalPlaces(2))!,
      maxTotalCollateral: oneDecimal(1, 4, 3),
      maxLeverage,
      userCollateral: collateral,
      collateralFromUserBorrowed: DEFAULT_USER_BORROWED,
      collateralFromMaxDebt: oneDecimal(0.01, 0.5, 3),
      avgPrice: lowPrice,
    }),
    createLoanIsApproved: approved ? createStub(true) : createIsApprovedStub(createLoanLeverageApprove),
    estimateGasCreateLoan: createStub(`${oneInt(80_000, 220_000)}`),
    createLoan: createStub(TEST_TX_HASH),
    createLoanApprove: createLoanLeverageApprove,
    estimateGasCreateLoanApprove: createStub(`${oneInt(70_000, 200_000)}`),
    createLoanExpectedCollateral: createStub(leverageMetrics()),
    createLoanPriceImpact: createStub(oneDecimal(0.01, 1, 3)),
    maxLeverage: createStub(maxLeverage),
  } as const
  const stubs = leverage ? leverageStubs : normalStubs

  seedMarketBalances(chainId, collateralAddress)

  const leverageV2 = {
    hasLeverage: () => leverage,
    maxLeverage: leverageStubs.maxLeverage,
    createLoanHealth: leverageStubs.createLoanHealth,
    createLoanPrices: leverageStubs.createLoanPrices,
    createLoanMaxRecv: leverageStubs.createLoanMaxRecv,
    createLoanIsApproved: leverageStubs.createLoanIsApproved,
    createLoanApprove: leverageStubs.createLoanApprove,
    createLoan: leverageStubs.createLoan,
    createLoanExpectedCollateral: leverageStubs.createLoanExpectedCollateral,
    createLoanPriceImpact: leverageStubs.createLoanPriceImpact,
    estimateGas: {
      createLoan: leverageStubs.estimateGasCreateLoan,
      createLoanApprove: leverageStubs.estimateGasCreateLoanApprove,
    },
  }

  const expectedArgs = leverage
    ? {
        query: [collateral, DEFAULT_USER_BORROWED, borrow, presetRange] as const,
        estimateGas: [collateral, DEFAULT_USER_BORROWED, borrow, presetRange, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        maxRecv: [collateral, DEFAULT_USER_BORROWED, presetRange] as const,
        approved: [collateral, DEFAULT_USER_BORROWED] as const,
        estimateGasApprove: [collateral, DEFAULT_USER_BORROWED] as const,
        approve: [collateral, DEFAULT_USER_BORROWED] as const,
        submit: [collateral, DEFAULT_USER_BORROWED, borrow, presetRange, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        leverage: {
          expectedCollateral: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
          priceImpact: [DEFAULT_USER_BORROWED, borrow] as const,
        },
      }
    : {
        query: [collateral, borrow, presetRange] as const,
        estimateGas: [collateral, borrow, presetRange] as const,
        maxRecv: [collateral, presetRange] as const,
        approved: [collateral] as const,
        estimateGasApprove: [collateral] as const,
        approve: [collateral] as const,
        submit: [collateral, borrow, presetRange, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        leverage: undefined,
      }

  const market = createMockMintMarket({
    collateral: collateralAddress,
    controller: oneAddress(),
    leverageV2,
    stats: { parameters: createStub(oneAprPair()) },
    estimateGas: {
      createLoan: normalStubs.estimateGasCreateLoan,
      createLoanApprove: normalStubs.estimateGasCreateLoanApprove,
    },
    createLoanHealth: normalStubs.createLoanHealth,
    createLoanPrices: normalStubs.createLoanPrices,
    createLoanMaxRecv: normalStubs.createLoanMaxRecv,
    createLoanIsApproved: normalStubs.createLoanIsApproved,
    createLoanApprove: normalStubs.createLoanApprove,
    createLoan: normalStubs.createLoan,
  })

  return {
    collateral,
    borrow,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: expectedArgs,
    stubs,
  }
}

export const createBorrowMoreScenario = ({
  chainId,
  approved,
  collateral = '0' as const,
  leverage = false,
}: {
  chainId: number
  approved: boolean
  collateral?: Decimal
  leverage?: boolean
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(1, 45, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = decimalSum(expectedCurrentDebt, borrow)

  const borrowMoreApprove = createStub(TEST_TX_HASH)
  const borrowMoreLeverageApprove = createStub(TEST_TX_HASH)
  const normalStubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub(oneDecimal(100, 900, 2)),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub(borrowMoreApprove),
    borrowMore: createStub(TEST_TX_HASH),
    borrowMoreApprove,
    borrowMorePrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    borrowMoreExpectedCollateral: createStub(leverageMetrics()),
    borrowMoreFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    borrowMorePriceImpact: createStub(oneDecimal(0.01, 1, 3)),
    maxLeverage: createStub(oneDecimal(1.5, 10, 2)),
    loanExists: createStub(true),
    userPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
  } as const
  const leverageStubs = {
    parameters: normalStubs.parameters,
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub({
      maxDebt: oneDecimal(100, 900, 2),
      maxTotalCollateral: oneDecimal(1, 4, 3),
      userCollateral: collateral,
      collateralFromUserBorrowed: DEFAULT_USER_BORROWED,
      collateralFromMaxDebt: oneDecimal(0.01, 0.5, 3),
      avgPrice: oneDecimal(900, 2300, 2),
    }),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub(borrowMoreLeverageApprove),
    borrowMore: createStub(TEST_TX_HASH),
    borrowMoreApprove: borrowMoreLeverageApprove,
    borrowMorePrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    borrowMoreExpectedCollateral: createStub(leverageMetrics()),
    borrowMoreFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    borrowMorePriceImpact: createStub(oneDecimal(0.01, 1, 3)),
    maxLeverage: createStub(oneDecimal(1.5, 10, 2)),
    loanExists: normalStubs.loanExists,
    userPrices: normalStubs.userPrices,
  } as const
  const stubs = leverage ? leverageStubs : normalStubs

  const leverageV2 = {
    hasLeverage: () => leverage,
    maxLeverage: leverageStubs.maxLeverage,
    borrowMoreHealth: leverageStubs.borrowMoreHealth,
    borrowMoreMaxRecv: leverageStubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: leverageStubs.borrowMoreIsApproved,
    borrowMoreApprove: leverageStubs.borrowMoreApprove,
    borrowMore: leverageStubs.borrowMore,
    borrowMorePrices: leverageStubs.borrowMorePrices,
    borrowMoreExpectedCollateral: leverageStubs.borrowMoreExpectedCollateral,
    borrowMoreFutureLeverage: leverageStubs.borrowMoreFutureLeverage,
    borrowMorePriceImpact: leverageStubs.borrowMorePriceImpact,
    estimateGas: {
      borrowMore: leverageStubs.estimateGasBorrowMore,
      borrowMoreApprove: leverageStubs.estimateGasBorrowMoreApprove,
    },
  }

  const expectedArgs = leverage
    ? {
        health: [collateral, DEFAULT_USER_BORROWED, borrow] as const,
        maxRecv: [collateral, DEFAULT_USER_BORROWED] as const,
        isApproved: [collateral, DEFAULT_USER_BORROWED] as const,
        estimateGasApprove: [collateral, DEFAULT_USER_BORROWED] as const,
        approve: [collateral, DEFAULT_USER_BORROWED] as const,
        estimateGas: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        submit: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        leverage: {
          expectedCollateral: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
          futureLeverage: [collateral, DEFAULT_USER_BORROWED, borrow] as const,
          priceImpact: [DEFAULT_USER_BORROWED, borrow] as const,
        },
      }
    : {
        health: [collateral, borrow] as const,
        maxRecv: [collateral] as const,
        isApproved: [collateral] as const,
        estimateGasApprove: [collateral] as const,
        approve: [collateral] as const,
        estimateGas: [collateral, borrow] as const,
        submit: [collateral, borrow] as const,
        leverage: undefined,
      }

  const market = createMockMintMarket({
    leverageV2,
    stats: { parameters: normalStubs.parameters },
    estimateGas: {
      borrowMore: normalStubs.estimateGasBorrowMore,
      borrowMoreApprove: normalStubs.estimateGasBorrowMoreApprove,
    },
    userState: createStub({ collateral: '1', stablecoin: '0', debt: expectedCurrentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    borrowMoreHealth: normalStubs.borrowMoreHealth,
    borrowMoreMaxRecv: normalStubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: normalStubs.borrowMoreIsApproved,
    borrowMoreApprove: normalStubs.borrowMoreApprove,
    borrowMore: normalStubs.borrowMore,
    borrowMorePrices: normalStubs.borrowMorePrices,
    loanExists: normalStubs.loanExists,
    userPrices: normalStubs.userPrices,
  })

  return {
    borrow,
    collateral,
    userBorrowed: '0' as const,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: expectedArgs,
    stubs,
  }
}

export const createRepayScenario = ({
  chainId,
  approved,
  leverage = false,
}: {
  chainId: number
  approved: boolean
  leverage?: boolean
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = decimalSum(borrow, oneDecimal(0.5, 50, 2))
  const expectedBorrowed = {
    ...expectedBorrowedMetrics(),
    totalBorrowed: oneDecimal(0.1, Math.max(0.2, Number(currentDebt) - 0.1), 2),
  }
  const repayApproveStub = createStub(TEST_TX_HASH)
  const repayLeverageApproveStub = createStub(TEST_TX_HASH)
  const estimateGasRepayApproveStub = createStub(oneInt(90_000, 180_000))

  const normalStubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: estimateGasRepayApproveStub,
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayApproveStub),
    repayApprove: repayApproveStub,
    repay: createStub(TEST_TX_HASH),
    repayExpectedBorrowed: createStub(expectedBorrowed),
    repayFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    repayPriceImpact: createStub(oneDecimal(0.01, 1, 3)),
  } as const
  const leverageStubs = {
    parameters: normalStubs.parameters,
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayLeverageApproveStub),
    repayApprove: repayLeverageApproveStub,
    repay: createStub(TEST_TX_HASH),
    repayExpectedBorrowed: createStub(expectedBorrowed),
    repayFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    repayPriceImpact: createStub(oneDecimal(0.01, 1, 3)),
  } as const
  const stubs = leverage ? leverageStubs : normalStubs

  const leverageV2 = {
    hasLeverage: () => leverage,
    repayHealth: leverageStubs.repayHealth,
    repayPrices: leverageStubs.repayPrices,
    repayIsApproved: leverageStubs.repayIsApproved,
    repayApprove: leverageStubs.repayApprove,
    repay: leverageStubs.repay,
    repayExpectedBorrowed: leverageStubs.repayExpectedBorrowed,
    repayFutureLeverage: leverageStubs.repayFutureLeverage,
    repayPriceImpact: leverageStubs.repayPriceImpact,
    estimateGas: {
      repay: leverageStubs.estimateGasRepay,
      repayApprove: leverageStubs.estimateGasRepayApprove,
    },
  }

  const expectedArgs = leverage
    ? {
        health: [collateral, DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED, true] as const,
        prices: [collateral, DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED, TEST_ADDRESS] as const,
        isApproved: [DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED] as const,
        estimateGas: [collateral, DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        estimateGasApprove: [DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED] as const,
        approve: [DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED] as const,
        submit: [collateral, DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED, DEFAULT_LEVERAGE_SLIPPAGE] as const,
        leverage: {
          expectedBorrowed: [
            collateral,
            DEFAULT_USER_BORROWED,
            DEFAULT_USER_BORROWED,
            DEFAULT_LEVERAGE_SLIPPAGE,
          ] as const,
          futureLeverage: [collateral, DEFAULT_USER_BORROWED, DEFAULT_USER_BORROWED, TEST_ADDRESS] as const,
          priceImpact: [collateral, DEFAULT_USER_BORROWED] as const,
        },
      }
    : {
        health: [borrow, false] as const,
        prices: [borrow, TEST_ADDRESS] as const,
        isApproved: [borrow] as const,
        estimateGas: [borrow] as const,
        estimateGasApprove: [borrow] as const,
        approve: [borrow] as const,
        submit: [borrow] as const,
        leverage: undefined,
      }

  const market = createMockMintMarket({
    leverageV2,
    stats: { parameters: normalStubs.parameters },
    estimateGas: {
      repay: normalStubs.estimateGasRepay,
      ...(!approved && { repayApprove: normalStubs.estimateGasRepayApprove }),
    },
    userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    repayHealth: normalStubs.repayHealth,
    repayPrices: normalStubs.repayPrices,
    repayIsApproved: normalStubs.repayIsApproved,
    ...(!approved && { repayApprove: normalStubs.repayApprove }),
    repay: normalStubs.repay,
  })

  return {
    borrow,
    collateral,
    currentDebt,
    futureDebt: decimalMinus(currentDebt, leverage ? expectedBorrowed.totalBorrowed : borrow),
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: expectedArgs,
    stubs,
  }
}

export const createSoftLiquidationScenario = ({ chainId, approved }: { chainId: number; approved: boolean }) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.02, 0.6, 3)
  const stateBorrowed = oneDecimal(0.2, 8, 2)
  const debt = decimalSum(borrow, oneDecimal(0.5, 40, 2))
  const slippage = DEFAULT_LEVERAGE_SLIPPAGE
  const repayApproveStub = createStub(TEST_TX_HASH)
  const selfLiquidateApproveStub = createStub(TEST_TX_HASH)
  const estimateGasRepayApproveStub = createStub(oneInt(90_000, 180_000))

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 240_000)),
    estimateGasRepayApprove: estimateGasRepayApproveStub,
    estimateGasSelfLiquidate: createStub(oneInt(150_000, 280_000)),
    estimateGasSelfLiquidateApprove: createStub(oneInt(20_000, 150_000)),
    repayHealth: createStub(oneDecimal(30, 98, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayApproveStub),
    repayApprove: repayApproveStub,
    repay: createStub(TEST_TX_HASH),
    selfLiquidateIsApproved: approved ? createStub(true) : createIsApprovedStub(selfLiquidateApproveStub),
    selfLiquidateApprove: selfLiquidateApproveStub,
    selfLiquidate: createStub(TEST_TX_HASH),
    walletBalances: createStub({
      // Ensure wallet stablecoin balance is always enough to close the position
      // canClose requires: borrowed >= (debt - stablecoin) * 1.0001
      stablecoin: decimal(new BigNumber(debt).minus(stateBorrowed).times(1.0001).plus(1).decimalPlaces(2))!,
      collateral: oneDecimal(0.02, 0.5, 3),
    }),
    loanExists: createStub(true),
    userState: createStub({ collateral, stablecoin: stateBorrowed, debt }),
    userHealth: createStub(oneDecimal(20, 70, 2)),
    userPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      selfLiquidate: stubs.estimateGasSelfLiquidate,
      repayApprove: stubs.estimateGasRepayApprove,
      selfLiquidateApprove: stubs.estimateGasSelfLiquidateApprove,
    },
    wallet: { balances: stubs.walletBalances },
    loanExists: stubs.loanExists,
    userState: stubs.userState,
    userHealth: stubs.userHealth,
    userPrices: stubs.userPrices,
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
    debtAfterImprove: decimalMinus(debt, borrow),
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      improveHealth: {
        health: [borrow, false] as const,
        prices: [borrow, TEST_ADDRESS] as const,
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
