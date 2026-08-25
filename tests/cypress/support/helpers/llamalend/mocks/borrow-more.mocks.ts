/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Hex } from 'viem'
import { oneDecimal, oneInt } from '@cy/support/generators'
import { decimalSum } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { createMockLlamaApi, TEST_TX_HASH } from '../mock-loan-test-data'
import { createIsApprovedStub, createStub, createSyncStub, createTransactionStub } from '../test-stub.utils'
import {
  createBorrowMoreMintMarket,
  createMockLendLoanMarket,
  DEFAULT_COLLATERAL_ADDRESS,
  DEFAULT_USER_BORROWED,
  leverageMetrics,
  mockRouterRoutes,
  oneRatePair,
  ROUTE_MIN_RECV,
  routeMutationMeta,
  seedMarketBalances,
} from './shared.mocks'

export const createBorrowMoreScenario = ({
  chainId,
  approved,
  collateral = '0' as const,
  leverage = false,
  leverageImplementation,
  routeCalldata,
}: {
  chainId: number
  approved: boolean
  collateral?: Decimal
  leverage?: boolean
  leverageImplementation?: 'zapV2'
  routeCalldata?: Hex
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(1, 45, 2)
  const expectedCurrentDebt = oneDecimal(10, 200, 2)
  const expectedFutureDebt = decimalSum(expectedCurrentDebt, borrow)

  const borrowMoreApprove = createTransactionStub(TEST_TX_HASH)
  const borrowMoreLeverageApprove = createTransactionStub(TEST_TX_HASH)
  const normalStubs = {
    parameters: createStub(oneRatePair()),
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreHealth: createStub(oneDecimal(10, 65, 2)),
    borrowMoreMaxRecv: createStub(oneDecimal(100, 900, 2)),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub(borrowMoreApprove),
    borrowMore: createTransactionStub(TEST_TX_HASH),
    borrowMoreApprove,
    borrowMorePrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    borrowMoreExpectedCollateral: createStub(leverageMetrics()),
    borrowMoreFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    borrowMorePriceImpact: createStub(oneDecimal(0.01, 1, 3)),
    maxLeverage: createStub(oneDecimal(1.5, 10, 2)),
    loanExists: createStub(true),
    userPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
  } as const
  const zapV2Stubs = {
    parameters: normalStubs.parameters,
    estimateGasBorrowMore: createStub(oneInt(120_000, 240_000)),
    estimateGasBorrowMoreApprove: createStub(oneInt(90_000, 180_000)),
    borrowMoreExpectedMetrics: createStub({
      health: oneDecimal(10, 65, 2),
      prices: [oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)],
      priceImpact: oneDecimal(0.01, 1, 3),
    }),
    borrowMoreMaxRecv: createStub({
      maxDebt: oneDecimal(100, 900, 2),
      maxTotalCollateral: oneDecimal(1, 4, 3),
      userCollateral: collateral,
      collateralFromUserBorrowed: DEFAULT_USER_BORROWED,
      collateralFromMaxDebt: oneDecimal(0.01, 0.5, 3),
      avgPrice: oneDecimal(900, 2300, 2),
    }),
    borrowMoreIsApproved: approved ? createStub(true) : createIsApprovedStub(borrowMoreLeverageApprove),
    borrowMore: createTransactionStub(TEST_TX_HASH),
    borrowMoreApprove: borrowMoreLeverageApprove,
    borrowMoreExpectedCollateral: createStub(leverageMetrics()),
    borrowMoreFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    maxLeverage: createStub(oneDecimal(1.5, 10, 2)),
    calcMinRecv: createSyncStub(ROUTE_MIN_RECV),
    loanExists: normalStubs.loanExists,
    userPrices: normalStubs.userPrices,
  } as const
  const useZapV2 = leverage && leverageImplementation === 'zapV2'

  if (useZapV2) mockRouterRoutes(chainId, routeCalldata)

  const leverageZapV2 = {
    hasLeverage: () => true,
    maxLeverage: zapV2Stubs.maxLeverage,
    borrowMoreExpectedMetrics: zapV2Stubs.borrowMoreExpectedMetrics,
    borrowMoreMaxRecv: zapV2Stubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: zapV2Stubs.borrowMoreIsApproved,
    borrowMoreApprove: zapV2Stubs.borrowMoreApprove,
    borrowMore: zapV2Stubs.borrowMore,
    borrowMoreExpectedCollateral: zapV2Stubs.borrowMoreExpectedCollateral,
    borrowMoreFutureLeverage: zapV2Stubs.borrowMoreFutureLeverage,
    calcMinRecv: zapV2Stubs.calcMinRecv,
    estimateGas: {
      borrowMore: zapV2Stubs.estimateGasBorrowMore,
      borrowMoreApprove: zapV2Stubs.estimateGasBorrowMoreApprove,
    },
  }
  const zapV2Expected = {
    metrics: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED, dDebt: borrow, debt: borrow },
    maxRecv: { userCollateral: collateral },
    isApproved: { userCollateral: collateral },
    estimateGasApprove: { userCollateral: collateral },
    approve: { userCollateral: collateral },
    estimateGas: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      dDebt: borrow,
      debt: borrow,
      ...routeMutationMeta,
    },
    submit: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      dDebt: borrow,
      debt: borrow,
      ...routeMutationMeta,
    },
    expectedCollateral: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      dDebt: borrow,
      debt: borrow,
      ...routeMutationMeta,
    },
    futureLeverage: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      dDebt: borrow,
      debt: borrow,
      ...routeMutationMeta,
    },
  } as const
  const normalExpected = {
    health: [collateral, borrow] as const,
    maxRecv: [collateral] as const,
    isApproved: [collateral] as const,
    estimateGasApprove: [collateral] as const,
    approve: [collateral] as const,
    estimateGas: [collateral, borrow] as const,
    submit: [collateral, borrow] as const,
  } as const
  const loan = {
    estimateGas: {
      borrowMore: normalStubs.estimateGasBorrowMore,
      borrowMoreApprove: normalStubs.estimateGasBorrowMoreApprove,
    },
    borrowMoreHealth: normalStubs.borrowMoreHealth,
    borrowMoreMaxRecv: normalStubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: normalStubs.borrowMoreIsApproved,
    borrowMoreApprove: normalStubs.borrowMoreApprove,
    borrowMore: normalStubs.borrowMore,
    borrowMorePrices: normalStubs.borrowMorePrices,
  }
  const market = useZapV2
    ? createMockLendLoanMarket({
        loan,
        leverage: { maxLeverage: zapV2Stubs.maxLeverage },
        leverageZapV2,
        stats: { parameters: normalStubs.parameters },
        userState: createStub({ collateral: '1', stablecoin: '0', debt: expectedCurrentDebt }),
        userHealth: createStub(oneDecimal(20, 80, 2)),
        loanExists: normalStubs.loanExists,
        userPrices: normalStubs.userPrices,
      })
    : createBorrowMoreMintMarket({ normalStubs, expectedCurrentDebt })

  return {
    borrow,
    expectedCurrentDebt,
    expectedFutureDebt,
    market,
    llamaApi: createMockLlamaApi(chainId, market),
    assertPreSubmit: () => {
      if (useZapV2) {
        expect(zapV2Stubs.maxLeverage).to.have.been.called
        expect(zapV2Stubs.borrowMoreExpectedMetrics).to.have.been.calledWithMatch(zapV2Expected.metrics)
        expect(zapV2Stubs.borrowMoreMaxRecv).to.have.been.calledWithMatch(zapV2Expected.maxRecv)
        expect(zapV2Stubs.borrowMoreIsApproved).to.have.been.calledWithMatch(zapV2Expected.isApproved)
        expect(zapV2Stubs.borrowMoreExpectedCollateral).to.have.been.calledWithMatch(zapV2Expected.expectedCollateral)
        expect(zapV2Stubs.borrowMoreFutureLeverage).to.have.been.calledWithMatch(zapV2Expected.futureLeverage)
        if (approved) {
          expect(zapV2Stubs.estimateGasBorrowMore).to.have.been.calledWithMatch(zapV2Expected.estimateGas)
          expect(zapV2Stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        } else {
          expect(zapV2Stubs.estimateGasBorrowMoreApprove).to.have.been.calledWithMatch(zapV2Expected.estimateGasApprove)
        }
      } else {
        expect(normalStubs.parameters).to.have.been.calledWithExactly()
        expect(normalStubs.borrowMoreHealth).to.have.been.calledWithExactly(...normalExpected.health)
        expect(normalStubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...normalExpected.maxRecv)
        expect(normalStubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...normalExpected.isApproved)
        if (approved) {
          expect(normalStubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...normalExpected.estimateGas)
          expect(normalStubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        } else {
          expect(normalStubs.estimateGasBorrowMoreApprove).to.have.been.calledWithExactly(
            ...normalExpected.estimateGasApprove,
          )
        }
      }
    },
    assertSubmit: () => {
      if (useZapV2) {
        expect(zapV2Stubs.borrowMore).to.have.been.calledWithMatch(zapV2Expected.submit)
        if (approved) {
          expect(zapV2Stubs.estimateGasBorrowMore).to.have.been.calledWithMatch(zapV2Expected.estimateGas)
          expect(zapV2Stubs.borrowMoreApprove).to.not.have.been.called
        } else {
          expect(zapV2Stubs.borrowMoreApprove).to.have.been.calledWithMatch(zapV2Expected.approve)
        }
      } else {
        expect(normalStubs.borrowMore).to.have.been.calledWithExactly(...normalExpected.submit)
        if (approved) {
          expect(normalStubs.estimateGasBorrowMore).to.have.been.calledWithExactly(...normalExpected.estimateGas)
          expect(normalStubs.borrowMoreApprove).to.not.have.been.called
        } else {
          expect(normalStubs.borrowMoreApprove).to.have.been.calledWithExactly(...normalExpected.approve)
        }
      }
    },
  }
}
