import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { CRVUSD_ADDRESS, decimal } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from './mock-loan-test-data'
import {
  createMockLendMarket,
  createMockLendVault,
  createMockMintMarket,
  type MockLendEstimateGas,
  type MockLendVault,
} from './mock-market.helpers'
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
    tokenAddress: CRVUSD_ADDRESS as Address,
    addresses: [TEST_ADDRESS],
    rawBalance: 10n ** 22n,
  })
}

const seedSupplyMarketBalances = ({
  chainId,
  borrowedTokenAddress,
  vaultAddress,
}: {
  chainId: number
  borrowedTokenAddress: Address
  vaultAddress: Address
}) => {
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: borrowedTokenAddress,
    addresses: [TEST_ADDRESS],
    rawBalance: 10n ** 22n,
  })
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: vaultAddress,
    addresses: [TEST_ADDRESS],
    rawBalance: 10n ** 22n,
  })
}

type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

// define our own interface so we don't get errors from SinonStub
type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
  callCount: number
}

const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

/** Creates an isApproved stub that returns false until approveStub has been called, then returns true. */
const createIsApprovedStub = (approveStub: TestStub<readonly [string], unknown>) =>
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

const debtAfterAdd = (baseDebt: string, delta: string) => decimal(new BigNumber(baseDebt).plus(delta).decimalPlaces(2))!
const debtAfterSub = (baseDebt: string, delta: string) =>
  decimal(new BigNumber(baseDebt).minus(delta).decimalPlaces(2))!

const sumDecimal = (a: string, b: string) => decimal(new BigNumber(a).plus(b).decimalPlaces(2))!
const subDecimal = (a: string, b: string) => decimal(new BigNumber(a).minus(b).decimalPlaces(2))!
const normalizeDecimalString = (value: string) => new BigNumber(value).toFixed()

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
    estimateGasCreateLoanApprove: createStub(`${oneInt(70_000, 200_000)}`)!,
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
      submit: [collateral, borrow, presetRange, 0.1] as const,
    },
    stubs,
  }
}

/** Default collateral address used in createMockMintMarket */
const DEFAULT_COLLATERAL_ADDRESS = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as Address

export const createBorrowMoreScenario = ({
  chainId,
  approved,
  collateral = '0' as const,
}: {
  chainId: number
  approved: boolean
  collateral?: string
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(1, 45, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = debtAfterAdd(expectedCurrentDebt, borrow)

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
  const currentDebt = debtAfterAdd(borrow, oneDecimal(0.5, 50, 2))
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
    futureDebt: debtAfterSub(currentDebt, borrow),
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

export const createSoftLiquidationScenario = ({ chainId, approved }: { chainId: number; approved: boolean }) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.02, 0.6, 3)
  const stateBorrowed = oneDecimal(0.2, 8, 2)
  const debt = debtAfterAdd(borrow, oneDecimal(0.5, 40, 2))
  const slippage = 0.1
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
    debtAfterImprove: debtAfterSub(debt, borrow),
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

const SUPPLY_MARKET_ID = 'one-way-market-7'
const SUPPLY_MARKET_ADDRESSES = {
  controller: '0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907' as Address,
  vault: '0x1111111111111111111111111111111111111111' as Address,
  gauge: '0x2222222222222222222222222222222222222222' as Address,
  borrowed: CRVUSD_ADDRESS as Address,
  collateral: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497' as Address,
} as const

const createSupplyRates = (lendApy: string) => ({
  borrowApr: '0.0825',
  borrowApy: '0.0841',
  lendApr: lendApy,
  lendApy,
})

const createIdentityConvertToAssetsStub = () =>
  cy.stub().callsFake(async (shares: string) => shares) as TestStub<readonly [string], string>

const createBaseSupplyMarket = ({
  chainId,
  walletBalances,
  vaultOverrides,
  currentApy,
  futureApy,
}: {
  chainId: number
  walletBalances: {
    collateral: string
    borrowed: string
    vaultShares: string
    gauge: string
  }
  vaultOverrides: Partial<Omit<MockLendVault, 'estimateGas'>> & {
    estimateGas?: Partial<MockLendEstimateGas>
  }
  currentApy: string
  futureApy: string
}) => {
  const statsRates = createStub(createSupplyRates(currentApy))
  const statsFutureRates = createStub(createSupplyRates(futureApy))
  const walletBalancesStub = createStub(walletBalances)
  const convertToAssets = createIdentityConvertToAssetsStub()
  const defaultVault = createMockLendVault()
  const { estimateGas: estimateGasOverrides, ...otherVaultOverrides } = vaultOverrides

  seedSupplyMarketBalances({
    chainId,
    borrowedTokenAddress: SUPPLY_MARKET_ADDRESSES.borrowed,
    vaultAddress: SUPPLY_MARKET_ADDRESSES.vault,
  })

  const market = createMockLendMarket({
    id: SUPPLY_MARKET_ID,
    collateral_token: {
      symbol: 'sUSDe',
      address: SUPPLY_MARKET_ADDRESSES.collateral,
      decimals: 18,
    },
    borrowed_token: {
      symbol: 'crvUSD',
      address: SUPPLY_MARKET_ADDRESSES.borrowed,
      decimals: 18,
    },
    addresses: SUPPLY_MARKET_ADDRESSES,
    stats: {
      rates: statsRates,
      futureRates: statsFutureRates,
    },
    wallet: {
      balances: walletBalancesStub,
    },
    vault: {
      ...defaultVault,
      ...otherVaultOverrides,
      convertToAssets,
      estimateGas: {
        ...defaultVault.estimateGas,
        ...estimateGasOverrides,
      },
    },
  })

  return {
    market,
    sharedStubs: {
      statsRates,
      statsFutureRates,
      walletBalances: walletBalancesStub,
      convertToAssets,
    },
  }
}

export const createDepositScenario = ({ chainId, approved }: { chainId: number; approved: boolean }) => {
  const input = { amount: '12.50' as const }
  const normalizedAmount = normalizeDecimalString(input.amount)
  const balances = {
    collateral: '0',
    borrowed: '0',
    vaultShares: '100.00',
    gauge: '25.00',
  } as const
  const currentApy = '0.0456'
  const futureApy = '0.0412'
  const depositApprove = createStub([TEST_TX_HASH])
  const depositIsApproved = approved ? createStub(true) : createIsApprovedStub(depositApprove)
  const previewDeposit = createStub(input.amount)
  const estimateGasDeposit = createStub(`${150_000}`)
  const estimateGasDepositApprove = createStub(`${95_000}`)
  const deposit = createStub(TEST_TX_HASH)

  const { market, sharedStubs } = createBaseSupplyMarket({
    chainId,
    walletBalances: balances,
    currentApy,
    futureApy,
    vaultOverrides: {
      previewDeposit,
      depositIsApproved,
      depositApprove,
      deposit,
      estimateGas: {
        deposit: estimateGasDeposit,
        depositApprove: estimateGasDepositApprove,
      },
    },
  })

  return {
    input,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      walletBalances: [] as const,
      marketRates: [false, false] as const,
      futureRates: [normalizedAmount, '0'] as const,
      previewDeposit: [normalizedAmount] as const,
      isApproved: [normalizedAmount] as const,
      estimateGas: [normalizedAmount] as const,
      estimateGasApprove: [normalizedAmount] as const,
      approve: [normalizedAmount] as const,
      submit: [normalizedAmount] as const,
      actionInfo: {
        supplyApy: futureApy,
        prevSupplyApy: currentApy,
        vaultShares: sumDecimal(sumDecimal(balances.vaultShares, balances.gauge), input.amount),
        prevVaultShares: sumDecimal(balances.vaultShares, balances.gauge),
        amountSupplied: sumDecimal(sumDecimal(balances.vaultShares, balances.gauge), input.amount),
        prevAmountSupplied: sumDecimal(balances.vaultShares, balances.gauge),
        symbol: 'crvUSD',
      },
    },
    stubs: {
      ...sharedStubs,
      previewDeposit,
      depositIsApproved,
      depositApprove,
      estimateGasDeposit,
      estimateGasDepositApprove,
      deposit,
    },
  }
}

export const createStakeScenario = ({ chainId, approved }: { chainId: number; approved: boolean }) => {
  const input = { amount: '15.00' as const }
  const normalizedAmount = normalizeDecimalString(input.amount)
  const balances = {
    collateral: '0',
    borrowed: '0',
    vaultShares: '80.00',
    gauge: '20.00',
  } as const
  const currentApy = '0.0375'
  const futureApy = currentApy
  const stakeApprove = createStub([TEST_TX_HASH])
  const stakeIsApproved = approved ? createStub(true) : createIsApprovedStub(stakeApprove)
  const estimateGasStake = createStub(`${132_000}`)
  const estimateGasStakeApprove = createStub(`${91_000}`)
  const stake = createStub(TEST_TX_HASH)

  const { market, sharedStubs } = createBaseSupplyMarket({
    chainId,
    walletBalances: balances,
    currentApy,
    futureApy,
    vaultOverrides: {
      stakeIsApproved,
      stakeApprove,
      stake,
      estimateGas: {
        stake: estimateGasStake,
        stakeApprove: estimateGasStakeApprove,
      },
    },
  })

  return {
    input,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      walletBalances: [] as const,
      marketRates: [false, false] as const,
      isApproved: [normalizedAmount] as const,
      estimateGas: [normalizedAmount] as const,
      estimateGasApprove: [normalizedAmount] as const,
      approve: [normalizedAmount] as const,
      submit: [normalizedAmount] as const,
      actionInfo: {
        supplyApy: currentApy,
        vaultShares: sumDecimal(balances.gauge, input.amount),
        prevVaultShares: balances.gauge,
        amountSupplied: sumDecimal(balances.gauge, input.amount),
        prevAmountSupplied: balances.gauge,
        symbol: 'crvUSD',
      },
    },
    stubs: {
      ...sharedStubs,
      stakeIsApproved,
      stakeApprove,
      estimateGasStake,
      estimateGasStakeApprove,
      stake,
    },
  }
}

export const createWithdrawScenario = ({
  chainId,
  isFull,
  depositedShares = '90.00',
  stakedShares = '10.00',
}: {
  chainId: number
  isFull: boolean
  depositedShares?: string
  stakedShares?: string
}) => {
  const input = {
    amount: (isFull ? depositedShares : '22.50') as Decimal,
    isFull,
  }
  const normalizedAmount = normalizeDecimalString(input.amount)
  const balances = {
    collateral: '0',
    borrowed: '0',
    vaultShares: depositedShares,
    gauge: stakedShares,
  } as const
  const currentApy = '0.0510'
  const futureApy = isFull ? '0.0540' : '0.0531'
  const previewWithdraw = createStub(input.amount)
  const estimateGasWithdraw = createStub(`${142_000}`)
  const estimateGasRedeem = createStub(`${149_000}`)
  const withdraw = createStub(TEST_TX_HASH)
  const redeem = createStub(TEST_TX_HASH)

  const { market, sharedStubs } = createBaseSupplyMarket({
    chainId,
    walletBalances: balances,
    currentApy,
    futureApy,
    vaultOverrides: {
      previewWithdraw,
      withdraw,
      redeem,
      estimateGas: {
        withdraw: estimateGasWithdraw,
        redeem: estimateGasRedeem,
      },
    },
  })

  return {
    input,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      walletBalances: [] as const,
      marketRates: [false, false] as const,
      futureRates: [normalizedAmount, '0'] as const,
      previewWithdraw: [normalizedAmount] as const,
      estimateGas: isFull ? ([depositedShares] as const) : ([normalizedAmount] as const),
      submit: isFull ? ([depositedShares] as const) : ([normalizedAmount] as const),
      actionInfo: {
        supplyApy: futureApy,
        prevSupplyApy: currentApy,
        vaultShares: subDecimal(sumDecimal(depositedShares, stakedShares), isFull ? depositedShares : input.amount),
        prevVaultShares: sumDecimal(depositedShares, stakedShares),
        amountSupplied: subDecimal(sumDecimal(depositedShares, stakedShares), input.amount),
        prevAmountSupplied: sumDecimal(depositedShares, stakedShares),
        symbol: 'crvUSD',
      },
    },
    stubs: {
      ...sharedStubs,
      previewWithdraw,
      estimateGasWithdraw,
      estimateGasRedeem,
      withdraw,
      redeem,
    },
  }
}

export const createUnstakeScenario = ({ chainId }: { chainId: number }) => {
  const input = { amount: '12.50' as const }
  const normalizedAmount = normalizeDecimalString(input.amount)
  const balances = {
    collateral: '0',
    borrowed: '0',
    vaultShares: '0',
    gauge: '40.00',
  } as const
  const currentApy = '0.0440'
  const futureApy = currentApy
  const estimateGasUnstake = createStub(`${121_000}`)
  const unstake = createStub(TEST_TX_HASH)

  const { market, sharedStubs } = createBaseSupplyMarket({
    chainId,
    walletBalances: balances,
    currentApy,
    futureApy,
    vaultOverrides: {
      unstake,
      estimateGas: {
        unstake: estimateGasUnstake,
      },
    },
  })

  return {
    input,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      walletBalances: [] as const,
      marketRates: [false, false] as const,
      estimateGas: [normalizedAmount] as const,
      submit: [normalizedAmount] as const,
      actionInfo: {
        supplyApy: currentApy,
        vaultShares: subDecimal(balances.gauge, input.amount),
        prevVaultShares: balances.gauge,
        amountSupplied: subDecimal(balances.gauge, input.amount),
        prevAmountSupplied: balances.gauge,
        symbol: 'crvUSD',
      },
      alert: {
        title: 'Unstake only',
        description: 'recover your lent assets',
      },
    },
    stubs: {
      ...sharedStubs,
      estimateGasUnstake,
      unstake,
    },
  }
}

export const createClaimScenario = ({
  chainId,
  claimableCrv = '5.00',
  claimableRewards = [{ amount: '2.50', symbol: 'CVX', token: oneAddress() as Address }],
}: {
  chainId: number
  claimableCrv?: string
  claimableRewards?: { amount: string; symbol: string; token: Address }[]
}) => {
  const claimCrv = createStub(TEST_TX_HASH)
  const claimRewards = createStub(TEST_TX_HASH)
  const claimableCrvStub = createStub(claimableCrv)
  const claimableRewardsStub = createStub(claimableRewards)
  const estimateGasClaimCrv = createStub(`${77_000}`)
  const estimateGasClaimRewards = createStub(`${99_000}`)

  const { market, sharedStubs } = createBaseSupplyMarket({
    chainId,
    walletBalances: {
      collateral: '0',
      borrowed: '0',
      vaultShares: '0',
      gauge: '0',
    },
    currentApy: '0.0400',
    futureApy: '0.0400',
    vaultOverrides: {
      claimableCrv: claimableCrvStub,
      claimableRewards: claimableRewardsStub,
      claimCrv,
      claimRewards,
      estimateGas: {
        claimCrv: estimateGasClaimCrv,
        claimRewards: estimateGasClaimRewards,
      },
    },
  })

  return {
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    expected: {
      claimableCrv: [TEST_ADDRESS] as const,
      claimableRewards: [TEST_ADDRESS] as const,
      shouldClaimCrv: Number(claimableCrv) > 0,
      shouldClaimRewards: claimableRewards.some(({ amount }) => Number(amount) > 0),
      buttonDisabled: Number(claimableCrv) <= 0 && claimableRewards.every(({ amount }) => Number(amount) <= 0),
      table: {
        rows: [
          ...(Number(claimableCrv) > 0
            ? [{ amount: claimableCrv, symbol: 'CRV', notional: Number(claimableCrv) }]
            : []),
          ...claimableRewards.map(({ amount, symbol }) => ({ amount, symbol, notional: Number(amount) })),
        ],
        totalNotional:
          (Number(claimableCrv) > 0 ? Number(claimableCrv) : 0) +
          claimableRewards.reduce((sum, { amount }) => sum + Number(amount), 0),
      },
    },
    stubs: {
      ...sharedStubs,
      claimableCrv: claimableCrvStub,
      claimableRewards: claimableRewardsStub,
      estimateGasClaimCrv,
      estimateGasClaimRewards,
      claimCrv,
      claimRewards,
    },
  }
}
