import { BigNumber } from 'bignumber.js'
import type { Address } from 'viem'
import { LEVERAGE } from '@/llamalend/constants'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { CRVUSD_ADDRESS, decimal, decimalMinus, decimalSum, formatNumber } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from './mock-loan-test-data'
import { createMockLendMarket, createMockMintMarket } from './mock-market.helpers'
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

export const createCreateLoanScenario = ({
  chainId,
  presetRange = 50,
  approved,
}: {
  chainId: number
  presetRange?: number
  approved: boolean
}) => {
  const collateral = oneDecimal(0.05, 1.2, 3)
  const borrow = oneDecimal(5, 140, 2)
  const collateralAddress = oneAddress()
  const lowPrice = oneDecimal(900, 2300, 2)
  const createLoanApprove = createStub(TEST_TX_HASH)

  const stubs = {
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
  } as const

  seedMarketBalances(chainId, collateralAddress)

  const market = createMockMintMarket({
    collateral: collateralAddress,
    controller: oneAddress(),
    stats: { parameters: createStub(oneAprPair()) },
    estimateGas: { createLoan: stubs.estimateGasCreateLoan, createLoanApprove: stubs.estimateGasCreateLoanApprove },
    createLoanHealth: stubs.createLoanHealth,
    createLoanPrices: stubs.createLoanPrices,
    createLoanMaxRecv: stubs.createLoanMaxRecv,
    createLoanIsApproved: stubs.createLoanIsApproved,
    createLoanApprove: stubs.createLoanApprove,
    createLoan: stubs.createLoan,
  })

  return {
    collateral,
    borrow,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      query: [collateral, borrow, presetRange] as const,
      estimateGas: [collateral, borrow, presetRange] as const,
      maxRecv: [collateral, presetRange] as const,
      approved: [collateral] as const,
      estimateGasApprove: [collateral] as const,
      approve: [collateral] as const,
      submit: [collateral, borrow, presetRange] as const,
    },
    stubs,
  }
}

/** Default collateral address used in createMockMintMarket */
const DEFAULT_COLLATERAL_ADDRESS = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as const

export const createBorrowMoreScenario = ({
  chainId,
  approved,
  collateral = '0' as const,
}: {
  chainId: number
  approved: boolean
  collateral?: Decimal
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(1, 45, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = decimalSum(expectedCurrentDebt, borrow)

  const borrowMoreApprove = createStub(TEST_TX_HASH)
  const borrowMorePrices = createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)])
  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub(oneDecimal(100, 900, 2)),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub(borrowMoreApprove),
    borrowMore: createStub(TEST_TX_HASH),
    borrowMoreApprove,
    borrowMorePrices,
    loanExists: createStub(true),
    userPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: { borrowMore: stubs.estimateGasBorrowMore, borrowMoreApprove: stubs.estimateGasBorrowMoreApprove },
    userState: createStub({ collateral: '1', stablecoin: '0', debt: expectedCurrentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    borrowMoreHealth: stubs.borrowMoreHealth,
    borrowMoreMaxRecv: stubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: stubs.borrowMoreIsApproved,
    borrowMoreApprove: stubs.borrowMoreApprove,
    borrowMore: stubs.borrowMore,
    borrowMorePrices: stubs.borrowMorePrices,
    loanExists: stubs.loanExists,
    userPrices: stubs.userPrices,
  })

  return {
    borrow,
    collateral,
    userBorrowed: '0' as const,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: [collateral, borrow] as const,
      maxRecv: [collateral] as const,
      isApproved: [collateral] as const,
      estimateGasApprove: [collateral] as const,
      approve: [collateral] as const,
      estimateGas: [collateral, borrow] as const,
      submit: [collateral, borrow] as const,
    },
    stubs,
  }
}

export const createRepayScenario = ({ chainId, approved }: { chainId: number; approved: boolean }) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = decimalSum(borrow, oneDecimal(0.5, 50, 2))
  const repayApproveStub = createStub(TEST_TX_HASH)
  const estimateGasRepayApproveStub = createStub(oneInt(90_000, 180_000))

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: estimateGasRepayApproveStub,
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayApproveStub),
    repayApprove: repayApproveStub,
    repay: createStub(TEST_TX_HASH),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      repay: stubs.estimateGasRepay,
      ...(!approved && { repayApprove: stubs.estimateGasRepayApprove }),
    },
    userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    repayHealth: stubs.repayHealth,
    repayPrices: stubs.repayPrices,
    repayIsApproved: stubs.repayIsApproved,
    ...(!approved && { repayApprove: stubs.repayApprove }),
    repay: stubs.repay,
  })

  return {
    borrow,
    collateral,
    currentDebt,
    futureDebt: decimalMinus(currentDebt, borrow),
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: [borrow, false] as const,
      prices: [borrow, TEST_ADDRESS] as const,
      isApproved: [borrow] as const,
      estimateGas: [borrow] as const,
      estimateGasApprove: [borrow] as const,
      approve: [borrow] as const,
      submit: [borrow] as const,
    },
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

export const createResetPositionScenario = ({
  chainId,
  approved,
  minBorrowed = '1000',
  isResetAvailable = true,
}: {
  chainId: number
  approved: boolean
  minBorrowed?: Decimal
  isResetAvailable?: boolean
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const convertedBorrowed = '4500' as const
  const userBorrowed = '1000' as const
  const moreUserBorrowed = '2000' as const
  const belowMinBorrowed = '999' as const
  const collateral = '10' as const
  const debt = '10000' as const
  const fullRepayUserBorrowed = decimalMinus(debt, convertedBorrowed)
  const repayApproveStub = createStub(TEST_TX_HASH)
  const getDebtReduction = (walletBorrowed: Decimal) => decimalSum(convertedBorrowed, walletBorrowed)
  const getFutureDebt = (walletBorrowed: Decimal) => decimalMinus(debt, decimalSum(convertedBorrowed, walletBorrowed))
  const getExpected = (walletBorrowed: Decimal) => {
    const resetRepayParams = { debt: walletBorrowed, address: TEST_ADDRESS, shrink: true } as const
    const debtReduction = getDebtReduction(walletBorrowed)
    return {
      tokensToShrink: ['0', TEST_ADDRESS] as const,
      rates: [false, false] as const,
      futureRates: ['0', decimalMinus(getFutureDebt(walletBorrowed), debt), false] as const,
      isAvailable: [TEST_ADDRESS] as const,
      health: [{ ...resetRepayParams, full: false }] as const,
      prices: [resetRepayParams] as const,
      isApproved: [walletBorrowed] as const,
      estimateGas: [resetRepayParams] as const,
      estimateGasApprove: [walletBorrowed] as const,
      approve: [walletBorrowed] as const,
      submit: [resetRepayParams] as const,
      successMessage: `Position reset! ${formatNumber(debtReduction, { abbreviate: false })} crvUSD`,
    }
  }

  const stubs = {
    rates: createStub(generateMarketRates()),
    futureRates: createStub(generateMarketRates()),
    estimateGasRepay: createStub(oneInt(120_000, 240_000)),
    estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
    isRepayWithShrinkAvailable: createStub(isResetAvailable),
    tokensToShrink: createStub(minBorrowed),
    repayHealth: createStub(oneDecimal(30, 98, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayApproveStub),
    repayApprove: repayApproveStub,
    repay: createStub(TEST_TX_HASH),
    loanExists: createStub(true),
    userState: createStub({ collateral, borrowed: convertedBorrowed, debt, N: 10 }),
    userHealth: createStub(oneDecimal(20, 70, 2)),
    userPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    oraclePrice: createStub(oneDecimal(2500, 4200, 2)),
  } as const

  const market = createMockLendMarket({
    id: 'one-way-market-v2-0',
    version: 'v2',
    stats: { rates: stubs.rates, futureRates: stubs.futureRates },
    loan: {
      isRepayWithShrinkAvailable: stubs.isRepayWithShrinkAvailable,
      tokensToShrink: stubs.tokensToShrink,
      repayHealth: stubs.repayHealth,
      repayPrices: stubs.repayPrices,
      repayIsApproved: stubs.repayIsApproved,
      repayApprove: stubs.repayApprove,
      repay: stubs.repay,
      estimateGas: {
        repay: stubs.estimateGasRepay,
        repayApprove: stubs.estimateGasRepayApprove,
      },
    },
    prices: { oraclePrice: stubs.oraclePrice },
    userPosition: {
      userState: stubs.userState,
      userHealth: stubs.userHealth,
      userPrices: stubs.userPrices,
      userLoanExists: stubs.loanExists,
    },
  })

  return {
    convertedBorrowed,
    userBorrowed,
    moreUserBorrowed,
    belowMinBorrowed,
    fullRepayUserBorrowed,
    minBorrowed,
    debt,
    futureDebt: getFutureDebt(userBorrowed),
    getFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: getExpected(userBorrowed),
    getExpected,
    stubs,
  }
}
