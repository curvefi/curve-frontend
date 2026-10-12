/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Hex } from 'viem'
import { oneDecimal, oneInt } from '@cy/support/generators'
import { MarketVersion } from '@evm-ui/types/market'
import { decimalMinus, decimalSum } from '@ui/lib/decimal'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from '../mock-loan-test-data'
import { createMockMintMarket } from '../mock-market.helpers'
import { createIsApprovedStub, createStub, createSyncStub, createTransactionStub } from '../test-stub.utils'
import {
  createMockLendLoanMarket,
  createControllerApprovalStubs,
  DEFAULT_COLLATERAL_ADDRESS,
  DEFAULT_USER_BORROWED,
  expectedBorrowedMetrics,
  mockRouterRoutes,
  oneRatePair,
  ROUTE_MIN_RECV,
  routeMeta,
  routeMutationMeta,
  seedMarketBalances,
} from './shared.mocks'

export const createRepayScenario = ({
  chainId,
  approved,
  leverage = false,
  routeCalldata,
  controllerApproved = true,
  marketVersion = MarketVersion.v1,
}: {
  chainId: number
  approved: boolean
  leverage?: boolean
  routeCalldata?: Hex
  controllerApproved?: boolean
  marketVersion?: MarketVersion
}) => {
  seedMarketBalances(chainId, DEFAULT_COLLATERAL_ADDRESS)
  const borrow = oneDecimal(0.5, 20, 2)
  const collateral = oneDecimal(0.05, 2, 3)
  const currentDebt = decimalSum(borrow, oneDecimal(0.5, 50, 2))
  const expectedBorrowed = {
    ...expectedBorrowedMetrics(),
    totalBorrowed: oneDecimal(0.1, Math.max(0.2, Number(currentDebt) - 0.1), 2),
  }
  const repayApproveStub = createTransactionStub(TEST_TX_HASH)
  const controllerApproval = createControllerApprovalStubs(controllerApproved)
  const estimateGasRepayApproveStub = createStub(oneInt(90_000, 180_000))

  const normalStubs = {
    parameters: createStub(oneRatePair()),
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: estimateGasRepayApproveStub,
    repayHealth: createStub(oneDecimal(30, 95, 2)),
    repayPrices: createStub([oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)]),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayApproveStub),
    repayApprove: repayApproveStub,
    repay: createTransactionStub(TEST_TX_HASH),
    repayExpectedBorrowed: createStub(expectedBorrowed),
    repayFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    repayPriceImpact: createStub(oneDecimal(0.01, 1, 3)),
  } as const
  const leverageStubs = {
    parameters: normalStubs.parameters,
    estimateGasRepay: createStub(oneInt(120_000, 260_000)),
    estimateGasRepayApprove: createStub(oneInt(90_000, 180_000)),
    repayExpectedMetrics: createStub({
      health: oneDecimal(30, 95, 2),
      prices: [oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)],
      priceImpact: oneDecimal(0.01, 1, 3),
    }),
    repayIsApproved: createStub(true),
    repayIsAvailable: createStub(true),
    repayIsFull: createStub(false),
    repayApprove: createTransactionStub(TEST_TX_HASH),
    repay: createTransactionStub(TEST_TX_HASH),
    repayExpectedBorrowed: createStub(expectedBorrowed),
    repayFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    calcMinRecv: createSyncStub(ROUTE_MIN_RECV),
  } as const

  if (leverage) mockRouterRoutes(chainId, routeCalldata)

  const leverageZapV2 = {
    hasLeverage: () => true,
    isControllerApproved: controllerApproval.isControllerApproved,
    setControllerApproval: controllerApproval.setControllerApproval,
    repayExpectedMetrics: leverageStubs.repayExpectedMetrics,
    repayIsApproved: leverageStubs.repayIsApproved,
    repayIsAvailable: leverageStubs.repayIsAvailable,
    repayIsFull: leverageStubs.repayIsFull,
    repayApprove: leverageStubs.repayApprove,
    repay: leverageStubs.repay,
    repayExpectedBorrowed: leverageStubs.repayExpectedBorrowed,
    repayFutureLeverage: leverageStubs.repayFutureLeverage,
    calcMinRecv: leverageStubs.calcMinRecv,
    estimateGas: {
      repay: leverageStubs.estimateGasRepay,
      repayApprove: leverageStubs.estimateGasRepayApprove,
      setControllerApproval: controllerApproval.estimateGasSetControllerApproval,
    },
  }

  const expectedRoute = { ...routeMutationMeta, calldata: routeCalldata ?? routeMutationMeta.calldata }
  const leverageExpected = {
    metrics: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      healthIsFull: true,
      address: TEST_ADDRESS,
      ...routeMeta,
      calldata: expectedRoute.calldata,
    },
    estimateGas: { stateCollateral: collateral, userCollateral: DEFAULT_USER_BORROWED, ...expectedRoute },
    submit: { stateCollateral: collateral, userCollateral: DEFAULT_USER_BORROWED, ...expectedRoute },
    expectedBorrowed: { stateCollateral: collateral, userCollateral: DEFAULT_USER_BORROWED, ...expectedRoute },
    futureLeverage: { stateCollateral: collateral, userCollateral: DEFAULT_USER_BORROWED, ...expectedRoute },
  } as const
  const normalExpected = {
    health: [borrow, false] as const,
    prices: [borrow, TEST_ADDRESS] as const,
    isApproved: [borrow] as const,
    estimateGas: [borrow] as const,
    estimateGasApprove: [borrow] as const,
    approve: [borrow] as const,
    submit: [borrow] as const,
  } as const

  const loan = {
    estimateGas: {
      repay: normalStubs.estimateGasRepay,
      ...(!approved && { repayApprove: normalStubs.estimateGasRepayApprove }),
    },
    repayHealth: normalStubs.repayHealth,
    repayPrices: normalStubs.repayPrices,
    repayIsApproved: normalStubs.repayIsApproved,
    ...(!approved && { repayApprove: normalStubs.repayApprove }),
    repay: normalStubs.repay,
  }
  const market = leverage
    ? createMockLendLoanMarket({
        version: marketVersion,
        loan,
        leverage: { maxLeverage: createStub(oneDecimal(1.5, 10, 2)) },
        leverageZapV2,
        stats: { parameters: normalStubs.parameters },
        userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
        userHealth: createStub(oneDecimal(20, 80, 2)),
      })
    : createMockMintMarket({
        version: marketVersion,
        collateral: DEFAULT_COLLATERAL_ADDRESS,
        stats: { parameters: normalStubs.parameters },
        estimateGas: loan.estimateGas,
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
    assertPreSubmit: leverage
      ? () => {
          expect(controllerApproval.isControllerApproved).to.have.been.calledWithExactly(TEST_ADDRESS)
          expect(controllerApproval.setControllerApproval).to.not.have.been.called
          expect(leverageStubs.repay).to.not.have.been.called
          expect(leverageStubs.repayExpectedMetrics).to.have.been.calledWithMatch(leverageExpected.metrics)
          expect(leverageStubs.repayIsApproved).to.not.have.been.called
          expect(leverageStubs.estimateGasRepayApprove).to.not.have.been.called
          expect(leverageStubs.repayExpectedBorrowed).to.have.been.calledWithMatch(leverageExpected.expectedBorrowed)
          expect(leverageStubs.repayFutureLeverage).to.have.been.calledWithMatch(leverageExpected.futureLeverage)
          if (controllerApproved) {
            expect(leverageStubs.estimateGasRepay).to.have.been.calledWithMatch(leverageExpected.estimateGas)
          } else {
            expect(leverageStubs.estimateGasRepay).to.not.have.been.called
          }
        }
      : () => {
          expect(normalStubs.parameters).to.have.been.calledWithExactly()
          expect(normalStubs.repayHealth).to.have.been.calledWithExactly(...normalExpected.health)
          expect(normalStubs.repayPrices).to.have.been.calledWithExactly(...normalExpected.prices)
          expect(normalStubs.repayIsApproved).to.have.been.calledWithExactly(...normalExpected.isApproved)
          if (approved) {
            expect(normalStubs.estimateGasRepay).to.have.been.calledWithExactly(...normalExpected.estimateGas)
            expect(normalStubs.estimateGasRepayApprove).to.not.have.been.called
          } else {
            expect(normalStubs.estimateGasRepayApprove).to.have.been.calledWithExactly(
              ...normalExpected.estimateGasApprove,
            )
          }
        },
    assertSubmit: leverage
      ? () => {
          expect(controllerApproval.setControllerApproval.callCount).to.equal(controllerApproved ? 0 : 1)
          expect(leverageStubs.repay).to.have.been.calledOnce
          expect(leverageStubs.estimateGasRepay).to.have.been.calledWithMatch(leverageExpected.estimateGas)
          expect(leverageStubs.repay).to.have.been.calledWithMatch(leverageExpected.submit)
          expect(leverageStubs.repayApprove).to.not.have.been.called
        }
      : () => {
          expect(normalStubs.estimateGasRepay).to.have.been.calledWithExactly(...normalExpected.estimateGas)
          expect(normalStubs.repay).to.have.been.calledWithExactly(...normalExpected.submit)
          if (approved) {
            expect(normalStubs.repayApprove).to.not.have.been.called
          } else {
            expect(normalStubs.repayApprove).to.have.been.calledWithExactly(...normalExpected.approve)
          }
        },
  }
}
