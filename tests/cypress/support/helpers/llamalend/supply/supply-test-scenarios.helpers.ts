import BigNumber from 'bignumber.js'
import type { Address } from 'viem'
import { oneAddress } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { CRVUSD_ADDRESS, decimalMinus, decimalSum } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '../mock-loan-test-data'
import {
  createMockLendMarket,
  createMockLendVault,
  type MockLendEstimateGas,
  type MockLendVault,
} from '../mock-market.helpers'
import { seedErc20BalanceForAddresses } from '../query-cache.helpers'
import { createIsApprovedStub, createStub, type TestStub } from '../test-scenarios.helpers'

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

const SUPPLY_MARKET_ID = 'one-way-market-7'
const SUPPLY_MARKET_ADDRESSES = {
  controller: '0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
  vault: '0x1111111111111111111111111111111111111111',
  gauge: '0x2222222222222222222222222222222222222222',
  borrowed: CRVUSD_ADDRESS,
  collateral: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
} as const

const createSupplyRates = (lendApy: Decimal) => ({
  borrowApr: '0.0825',
  borrowApy: '0.0841',
  lendApr: lendApy,
  lendApy,
})

const createIdentityConvertToAssetsStub = () =>
  cy.stub().callsFake(async (shares: Decimal) => shares) as TestStub<readonly [string], string>

const createBaseSupplyMarket = ({
  chainId,
  walletBalances,
  vaultOverrides,
  currentApy,
  futureApy,
}: {
  chainId: number
  walletBalances: {
    collateral: Decimal
    borrowed: Decimal
    vaultShares: Decimal
    gauge: Decimal
  }
  vaultOverrides: Partial<Omit<MockLendVault, 'estimateGas'>> & {
    estimateGas?: Partial<MockLendEstimateGas>
  }
  currentApy: Decimal
  futureApy: Decimal
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
      // todo: symbol should be coming from test market list
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
  const amount = BigNumber(input.amount)
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
  const vaultShares = decimalSum(balances.vaultShares, balances.gauge)

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
      futureRates: [amount, '0'] as const,
      previewDeposit: [amount] as const,
      isApproved: [amount] as const,
      estimateGas: [amount] as const,
      estimateGasApprove: [amount] as const,
      approve: [amount] as const,
      submit: [amount] as const,
      actionInfo: {
        supplyApy: futureApy,
        prevSupplyApy: currentApy,
        vaultShares: decimalSum(vaultShares, input.amount),
        prevVaultShares: vaultShares,
        amountSupplied: decimalSum(vaultShares, input.amount),
        prevAmountSupplied: vaultShares,
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
  const amount = BigNumber(input.amount)
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
  const vaultShares = decimalSum(balances.gauge, input.amount)

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
      isApproved: [amount] as const,
      estimateGas: [amount] as const,
      estimateGasApprove: [amount] as const,
      approve: [amount] as const,
      submit: [amount] as const,
      actionInfo: {
        supplyApy: currentApy,
        vaultShares,
        prevVaultShares: balances.gauge,
        amountSupplied: vaultShares,
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
  depositedShares?: Decimal
  stakedShares?: Decimal
}) => {
  const input = {
    amount: (isFull ? depositedShares : '22.50') as Decimal,
    isFull,
  }
  const amount = BigNumber(input.amount)
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
  const vaultShares = decimalSum(depositedShares, stakedShares)

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
      futureRates: [amount, '0'] as const,
      previewWithdraw: [amount] as const,
      estimateGas: isFull ? ([depositedShares] as const) : ([amount] as const),
      submit: isFull ? ([depositedShares] as const) : ([amount] as const),
      actionInfo: {
        supplyApy: futureApy,
        prevSupplyApy: currentApy,
        vaultShares: decimalMinus(vaultShares, isFull ? depositedShares : input.amount),
        prevVaultShares: vaultShares,
        amountSupplied: decimalMinus(vaultShares, input.amount),
        prevAmountSupplied: vaultShares,
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
  const amount = BigNumber(input.amount)
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
  const vaultShares = decimalMinus(balances.gauge, input.amount)

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
      estimateGas: [amount] as const,
      submit: [amount] as const,
      actionInfo: {
        supplyApy: currentApy,
        vaultShares,
        prevVaultShares: balances.gauge,
        amountSupplied: decimalMinus(balances.gauge, input.amount),
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
  claimableRewards = [{ amount: '2.50', symbol: 'CVX', token: oneAddress() }],
}: {
  chainId: number
  claimableCrv?: Decimal
  claimableRewards?: { amount: Decimal; symbol: string; token: Address }[]
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
