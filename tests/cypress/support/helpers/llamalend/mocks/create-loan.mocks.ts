/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from 'bignumber.js'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import { decimal } from '@ui-kit/utils'
import { createMockLlamaApi, TEST_TX_HASH } from '../mock-loan-test-data'
import { createMockMintMarket } from '../mock-market.helpers'
import { createIsApprovedStub, createStub, createSyncStub } from '../test-stub.utils'
import {
  DEFAULT_COLLATERAL_ADDRESS,
  DEFAULT_USER_BORROWED,
  leverageMetrics,
  mockRouterRoutes,
  oneAprPair,
  ROUTE_MIN_RECV,
  routeMeta,
  routeMutationMeta,
  seedMarketBalances,
  createMockLendLoanMarket,
} from './shared.mocks'

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
    createLoanExpectedMetrics: createStub({
      health: oneDecimal(1, 98, 2),
      prices: [decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2))!, lowPrice],
      priceImpact: oneDecimal(0.01, 1, 3),
      bands: [oneInt(1, 5), oneInt(6, 15)],
    }),
    createLoanMaxRecv: createStub({
      maxDebt: decimal(new BigNumber(borrow).plus(oneFloat(10, 400)).decimalPlaces(2))!,
      maxTotalCollateral: decimal(new BigNumber(collateral).plus(oneFloat(0.1, 2)).decimalPlaces(3))!,
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
    maxLeverage: createStub(maxLeverage),
    calcMinRecv: createSyncStub(ROUTE_MIN_RECV),
  } as const

  seedMarketBalances(chainId, collateralAddress)

  if (leverage) mockRouterRoutes(chainId)

  const leverageZapV2 = {
    hasLeverage: () => true,
    maxLeverage: leverageStubs.maxLeverage,
    createLoanExpectedMetrics: leverageStubs.createLoanExpectedMetrics,
    createLoanMaxRecv: leverageStubs.createLoanMaxRecv,
    createLoanIsApproved: leverageStubs.createLoanIsApproved,
    createLoanApprove: leverageStubs.createLoanApprove,
    createLoan: leverageStubs.createLoan,
    createLoanExpectedCollateral: leverageStubs.createLoanExpectedCollateral,
    calcMinRecv: leverageStubs.calcMinRecv,
    estimateGas: {
      createLoan: leverageStubs.estimateGasCreateLoan,
      createLoanApprove: leverageStubs.estimateGasCreateLoanApprove,
    },
  }

  const leverageExpected = {
    query: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED, debt: borrow, range: presetRange },
    estimateGas: {
      userCollateral: collateral,
      debt: borrow,
      range: presetRange,
      ...routeMutationMeta,
    },
    maxRecv: { userCollateral: collateral, range: presetRange },
    approved: { userCollateral: collateral },
    estimateGasApprove: { userCollateral: collateral },
    approve: { userCollateral: collateral },
    submit: {
      userCollateral: collateral,
      debt: borrow,
      range: presetRange,
      ...routeMutationMeta,
    },
    expectedCollateral: {
      userCollateral: collateral,
      debt: borrow,
      ...routeMeta,
    },
    expectedMetrics: {
      userCollateral: collateral,
      debt: borrow,
      range: presetRange,
      ...routeMeta,
    },
  } as const
  const normalExpected = {
    query: [collateral, borrow, presetRange] as const,
    estimateGas: [collateral, borrow, presetRange] as const,
    maxRecv: [collateral, presetRange] as const,
    approved: [collateral] as const,
    estimateGasApprove: [collateral] as const,
    approve: [collateral] as const,
    submit: [collateral, borrow, presetRange] as const,
  } as const

  const market = leverage
    ? createMockLendLoanMarket({
        loan: {
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
        },
        leverage: { maxLeverage: leverageStubs.maxLeverage },
        leverageZapV2,
        stats: { parameters: createStub(oneAprPair()) },
      })
    : createMockMintMarket({
        collateral: collateralAddress,
        controller: oneAddress(),
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
    assertPreSubmit: leverage
      ? () => {
          expect(leverageStubs.createLoanExpectedMetrics).to.have.been.calledWithMatch(leverageExpected.expectedMetrics)
          expect(leverageStubs.createLoanMaxRecv).to.have.been.calledWithMatch(leverageExpected.maxRecv)
          expect(leverageStubs.createLoanIsApproved).to.have.been.calledWithMatch(leverageExpected.approved)
          expect(leverageStubs.createLoanExpectedCollateral).to.have.been.calledWithMatch(
            leverageExpected.expectedCollateral,
          )
          if (approved) {
            expect(leverageStubs.estimateGasCreateLoan).to.have.been.calledWithMatch(leverageExpected.estimateGas)
            expect(leverageStubs.estimateGasCreateLoanApprove).to.not.have.been.called
          } else {
            expect(leverageStubs.estimateGasCreateLoanApprove).to.have.been.calledWithMatch(
              leverageExpected.estimateGasApprove,
            )
          }
        }
      : () => {
          expect(normalStubs.createLoanHealth).to.have.been.calledWithExactly(...normalExpected.query)
          expect(normalStubs.createLoanPrices).to.have.been.calledWithExactly(...normalExpected.query)
          expect(normalStubs.createLoanMaxRecv).to.have.been.calledWithExactly(...normalExpected.maxRecv)
          expect(normalStubs.createLoanIsApproved).to.have.been.calledWithExactly(...normalExpected.approved)
          if (approved) {
            expect(normalStubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...normalExpected.estimateGas)
            expect(normalStubs.estimateGasCreateLoanApprove).to.not.have.been.called
          } else {
            expect(normalStubs.estimateGasCreateLoanApprove).to.have.been.calledWithExactly(
              ...normalExpected.estimateGasApprove,
            )
          }
        },
    assertSubmit: leverage
      ? () => {
          expect(leverageStubs.estimateGasCreateLoan).to.have.been.calledWithMatch(leverageExpected.estimateGas)
          if (approved) {
            expect(leverageStubs.createLoanApprove).to.not.have.been.called
          } else {
            expect(leverageStubs.createLoanApprove).to.have.been.calledWithMatch({ userCollateral: collateral })
          }
          expect(leverageStubs.createLoan).to.have.been.calledWithMatch({
            userCollateral: collateral,
            debt: borrow,
            range: presetRange,
            ...routeMutationMeta,
          })
        }
      : () => {
          expect(normalStubs.estimateGasCreateLoan).to.have.been.calledWithExactly(...normalExpected.estimateGas)
          if (approved) {
            expect(normalStubs.createLoanApprove).to.not.have.been.called
          } else {
            expect(normalStubs.createLoanApprove).to.have.been.calledWithExactly(...normalExpected.approve)
          }
          expect(normalStubs.createLoan).to.have.been.calledWithExactly(...normalExpected.submit)
        },
  }
}
