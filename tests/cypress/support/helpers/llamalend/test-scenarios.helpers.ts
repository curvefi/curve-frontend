import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import { CRVUSD_ADDRESS, decimal } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from './mock-loan-test-data'
import { createMockMintMarket } from './mock-market.helpers'
import { seedErc20BalanceForAddresses } from './query-cache.helpers'

/** Seed token balances for both collateral and borrow (crvUSD) tokens so useReadContracts doesn't make real RPC calls */
const seedMarketBalances = (chainId: number, collateralAddress: Address) => {
  const addresses = [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address]
  seedErc20BalanceForAddresses({ chainId, tokenAddress: collateralAddress, addresses, rawBalance: 10n ** 20n })
  seedErc20BalanceForAddresses({ chainId, tokenAddress: CRVUSD_ADDRESS as Address, addresses, rawBalance: 10n ** 22n })
}

type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
  callCount: number
}

const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

/** Creates an isApproved stub that returns false until approveStub has been called, then returns true. */
const createIsApprovedStub = <TArgs extends readonly TestStubArg[]>(
  approveStub: TestStub<readonly TestStubArg[], unknown>,
) => cy.stub().callsFake(async () => approveStub.callCount > 0) as TestStub<TArgs, boolean>

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

const debtAfterAdd = (baseDebt: string, delta: string) => decimal(new BigNumber(baseDebt).plus(delta).decimalPlaces(2))!
const debtAfterSub = (baseDebt: string, delta: string) =>
  decimal(new BigNumber(baseDebt).minus(delta).decimalPlaces(2))!

export const createCreateLoanScenario = ({
  chainId = 1,
  presetRange = 50,
  approved = true,
}: { chainId?: number; presetRange?: number; approved?: boolean } = {}) => {
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
    createLoanIsApproved: approved ? createStub(true) : createIsApprovedStub<readonly [string]>(createLoanApprove),
    estimateGasCreateLoan: createStub(`${oneInt(80_000, 220_000)}`),
    createLoan: createStub(TEST_TX_HASH),
    createLoanApprove,
    ...(!approved && {
      estimateGasCreateLoanApprove: createStub(`${oneInt(70_000, 200_000)}`)!,
    }),
  } as const

  seedMarketBalances(chainId, collateralAddress)

  const market = createMockMintMarket({
    collateral: collateralAddress,
    controller: oneAddress(),
    stats: { parameters: createStub(oneAprPair()) },
    estimateGas: {
      createLoan: stubs.estimateGasCreateLoan,
      ...((!approved && { createLoanApprove: stubs.estimateGasCreateLoanApprove }) || {}),
    },
    createLoanHealth: stubs.createLoanHealth,
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

/** Default collateral address used in createMockMintMarket */
const DEFAULT_COLLATERAL_ADDRESS = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as Address

export const createBorrowMoreScenario = ({
  chainId = 1,
  approved = true,
}: { chainId?: number; approved?: boolean } = {}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(1, 45, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = debtAfterAdd(expectedCurrentDebt, borrow)

  const borrowMoreApprove = createStub(TEST_TX_HASH)
  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub(oneDecimal(100, 900, 2)),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub<readonly [string]>(borrowMoreApprove),
    borrowMore: createStub(TEST_TX_HASH),
    borrowMoreApprove,
    ...(!approved && {
      estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    }),
  } as const

  const market = createMockMintMarket({
    stats: { parameters: stubs.parameters },
    estimateGas: {
      borrowMore: stubs.estimateGasBorrowMore,
      ...(!approved && { borrowMoreApprove: stubs.estimateGasBorrowMoreApprove }),
    },
    userState: createStub({ collateral: '0', stablecoin: '0', debt: expectedCurrentDebt }),
    userHealth: createStub(oneDecimal(20, 80, 2)),
    borrowMoreHealth: stubs.borrowMoreHealth,
    borrowMoreMaxRecv: stubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: stubs.borrowMoreIsApproved,
    ...(!approved && { borrowMoreApprove: stubs.borrowMoreApprove }),
    borrowMore: stubs.borrowMore,
  })

  return {
    borrow,
    collateral: '0' as const,
    userBorrowed: '0' as const,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      health: ['0', borrow] as const,
      maxRecv: ['0'] as const,
      isApproved: ['0'] as const,
      estimateGasApprove: ['0'] as const,
      approve: ['0'] as const,
      estimateGas: ['0', borrow] as const,
      submit: ['0', borrow] as const,
    },
    stubs,
  }
}

export const createRepayScenario = ({
  chainId = 1,
  approved = true,
}: { chainId?: number; approved?: boolean } = {}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = debtAfterAdd(borrow, oneDecimal(0.5, 50, 2))
  const futureDebt = debtAfterSub(currentDebt, borrow)

  const repayApproveStub = !approved ? createStub(TEST_TX_HASH) : null
  const estimateGasRepayApproveStub = !approved ? createStub(oneInt(90_000, 180_000)) : null

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub<readonly [string]>(repayApproveStub!),
    repay: createStub(TEST_TX_HASH),
    ...((!approved && {
      estimateGasRepayApprove: estimateGasRepayApproveStub!,
      repayApprove: repayApproveStub!,
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
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.02, 0.6, 3)
  const stateBorrowed = oneDecimal(0.2, 8, 2)
  const debt = debtAfterAdd(borrow, oneDecimal(0.5, 40, 2))
  const debtAfterImprove = debtAfterSub(debt, borrow)
  const slippage = 0.1

  // Ensure wallet stablecoin balance is always enough to close the position
  // canClose requires: borrowed >= (debt - stablecoin) * 1.0001
  const walletStablecoin = decimal(new BigNumber(debt).minus(stateBorrowed).times(1.0001).plus(1).decimalPlaces(2))!

  const repayApproveStub = !approved ? createStub(TEST_TX_HASH) : null
  const selfLiquidateApproveStub = !approved ? createStub(TEST_TX_HASH) : null
  const estimateGasRepayApproveStub = !approved ? createStub(oneInt(90_000, 180_000)) : null

  const stubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 240_000)),
    estimateGasSelfLiquidate: createStub(oneInt(150_000, 280_000)),
    repayHealth: createStub(oneDecimal(30, 98, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub<readonly [string]>(repayApproveStub!),
    repay: createStub(TEST_TX_HASH),
    selfLiquidateIsApproved: approved ? createStub(true) : createIsApprovedStub<readonly []>(selfLiquidateApproveStub!),
    selfLiquidate: createStub(TEST_TX_HASH),
    ...((!approved && {
      estimateGasRepayApprove: estimateGasRepayApproveStub!,
      repayApprove: repayApproveStub!,
      selfLiquidateApprove: selfLiquidateApproveStub!,
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
      balances: createStub({ stablecoin: walletStablecoin, collateral: oneDecimal(0.02, 0.5, 3) }),
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
