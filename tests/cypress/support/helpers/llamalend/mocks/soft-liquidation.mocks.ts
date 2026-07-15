import { BigNumber } from 'bignumber.js'
import { oneDecimal, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { decimal, decimalMinus, decimalSum, formatToken } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '../mock-loan-test-data'
import { createMockLendMarket, createMockMintMarket } from '../mock-market.helpers'
import { createIsApprovedStub, createStub } from '../test-stub.utils'
import {
  DEFAULT_COLLATERAL_ADDRESS,
  DEFAULT_LEVERAGE_SLIPPAGE,
  generateMarketRates,
  oneRatePair,
  seedMarketBalances,
} from './shared.mocks'

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
      successMessage: `Position reset! ${formatToken(debtReduction, 'crvUSD', 'compact')}`,
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
