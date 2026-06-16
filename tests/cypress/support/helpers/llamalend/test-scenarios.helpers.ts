/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from 'bignumber.js'
import type { Address } from 'viem'
import { LEVERAGE } from '@/llamalend/constants'
import { oneAddress, oneDecimal, oneFloat, oneInt } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import type { RoutesQuery } from '@ui-kit/entities/router-api'
import { CRVUSD_ADDRESS, decimal, decimalMinus, decimalSum } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { createMockLlamaApi, TEST_ADDRESS, TEST_TX_HASH } from './mock-loan-test-data'
import { createMockLendMarket, createMockLendStats, createMockMintMarket } from './mock-market.helpers'
import { seedErc20BalanceForAddresses } from './query-cache.helpers'

/** Seed token balances for both collateral and borrow (crvUSD) tokens so useReadContracts doesn't make real RPC calls */
const seedMarketBalances = (chainId: number, collateralAddress: Address) => {
  const balances = [
    { tokenAddress: collateralAddress, rawBalance: 10n ** 20n },
    { tokenAddress: CRVUSD_ADDRESS, rawBalance: 10n ** 22n },
  ] as const

  balances.forEach(({ tokenAddress, rawBalance }) => {
    const tokenAddresses = new Set<Address>([tokenAddress, tokenAddress.toLowerCase() as Address])
    tokenAddresses.forEach(address =>
      seedErc20BalanceForAddresses({
        chainId,
        tokenAddress: address,
        addresses: [TEST_ADDRESS],
        rawBalance,
      }),
    )
  })
}

export type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

// define our own interface so we don't get errors from SinonStub
export type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
  calledWithMatch: (...args: readonly TestStubArg[]) => boolean
  callCount: number
}

export const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

const createSyncStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().returns(result) as TestStub<TArgs, TResult>

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
const DEFAULT_COLLATERAL_ADDRESS = oneAddress()
const ROUTER_ADDRESS = oneAddress()
const ROUTER_CALLDATA = '0x1234' as const
const ROUTE_AMOUNT_OUT = `${10n ** 18n}` as const
const ROUTE_PRICE_IMPACT = oneDecimal(0.01, 1, 3)
const ROUTE_MIN_RECV = oneDecimal(0.01, 1, 3)
const routeMeta = {
  router: ROUTER_ADDRESS,
  calldata: ROUTER_CALLDATA,
  quote: {
    outAmount: ROUTE_AMOUNT_OUT,
    priceImpact: ROUTE_PRICE_IMPACT,
  },
} as const
const routeMutationMeta = {
  ...routeMeta,
  minRecv: ROUTE_MIN_RECV,
} as const

const mockRouterRoutes = (chainId: number) => {
  cy.intercept({ method: 'GET', pathname: '/api/router/v1/routes' }, req => {
    const { router, amountIn, tokenIn, tokenOut } = req.query as RoutesQuery
    req.reply({
      body: [
        {
          router,
          amountIn: [amountIn],
          amountOut: [ROUTE_AMOUNT_OUT],
          gas: null,
          priceImpact: ROUTE_PRICE_IMPACT,
          createdAt: Date.now(),
          warnings: [],
          route: [
            {
              name: 'Mock route',
              tokenIn: [tokenIn],
              tokenOut: [tokenOut],
              protocol: 'curve',
              action: 'swap',
              args: {},
              chainId,
            },
          ],
          tx: { to: ROUTER_ADDRESS, data: ROUTER_CALLDATA, from: TEST_ADDRESS, value: '0' },
        },
      ],
    })
  })
}

const createMockLendLoanMarket = ({
  loan,
  leverage,
  leverageZapV2,
  stats,
  userState,
  userHealth,
  userPrices,
  loanExists,
}: {
  loan: object
  leverage?: object
  leverageZapV2: object
  stats: object
  userState?: TestStub<readonly TestStubArg[], unknown>
  userHealth?: TestStub<readonly TestStubArg[], unknown>
  userPrices?: TestStub<readonly TestStubArg[], unknown>
  loanExists?: TestStub<readonly TestStubArg[], unknown>
}) =>
  createMockLendMarket({
    collateral_token: {
      symbol: 'wstETH',
      address: DEFAULT_COLLATERAL_ADDRESS,
      decimals: 18,
    },
    borrowed_token: {
      symbol: 'crvUSD',
      address: CRVUSD_ADDRESS,
      decimals: 18,
    },
    coinDecimals: [18, 18],
    coinAddresses: [DEFAULT_COLLATERAL_ADDRESS, CRVUSD_ADDRESS],
    prices: {
      oraclePrice: createStub(oneDecimal(1, 1.2, 3)),
      oraclePriceBand: createStub(oneDecimal(10, 20, 30)),
      price: createStub(oneDecimal(1, 1.2, 3)),
    },
    wallet: {
      balances: createStub({
        collateral: '100',
        borrowed: '10000',
        vaultShares: '0',
        gauge: '0',
      }),
    },
    stats: { ...createMockLendStats(), ...stats },
    loan,
    leverage: { hasLeverage: () => true, ...leverage },
    leverageZapV2,
    userPosition: {
      ...(userState && { userState }),
      ...(userHealth && { userHealth }),
      ...(userPrices && { userPrices }),
    },
    ...(loanExists && { loanExists }),
  })

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
    createLoanExpectedMetrics: createStub({
      health: oneDecimal(1, 98, 2),
      prices: [decimal(new BigNumber(lowPrice).plus(oneFloat(40, 800)).decimalPlaces(2))!, lowPrice],
      priceImpact: oneDecimal(0.01, 1, 3),
      bands: [oneInt(1, 5), oneInt(6, 15)],
    }),
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
      userBorrowed: DEFAULT_USER_BORROWED,
      debt: borrow,
      range: presetRange,
      ...routeMutationMeta,
    },
    maxRecv: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED, range: presetRange },
    approved: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    estimateGasApprove: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    approve: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    submit: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      debt: borrow,
      range: presetRange,
      ...routeMutationMeta,
    },
    expectedCollateral: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
      debt: borrow,
      ...routeMeta,
    },
    expectedMetrics: {
      userCollateral: collateral,
      userBorrowed: DEFAULT_USER_BORROWED,
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
    submit: [collateral, borrow, presetRange, DEFAULT_LEVERAGE_SLIPPAGE] as const,
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
            expect(leverageStubs.createLoanApprove).to.have.been.calledWithMatch(leverageExpected.approve)
          }
          expect(leverageStubs.createLoan).to.have.been.calledWithMatch(leverageExpected.submit)
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

export const createBorrowMoreScenario = ({
  chainId,
  approved,
  collateral = '0' as const,
  leverage = false,
  leverageImplementation,
}: {
  chainId: number
  approved: boolean
  collateral?: Decimal
  leverage?: boolean
  leverageImplementation?: 'leverageV2' | 'zapV2'
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
  const leverageV2Stubs = {
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
    borrowMore: createStub(TEST_TX_HASH),
    borrowMoreApprove: borrowMoreLeverageApprove,
    borrowMoreExpectedCollateral: createStub(leverageMetrics()),
    borrowMoreFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    maxLeverage: createStub(oneDecimal(1.5, 10, 2)),
    calcMinRecv: createSyncStub(ROUTE_MIN_RECV),
    loanExists: normalStubs.loanExists,
    userPrices: normalStubs.userPrices,
  } as const
  const useZapV2 = leverage && leverageImplementation === 'zapV2'
  const useLeverageV2 = leverage && leverageImplementation === 'leverageV2'

  if (useZapV2) mockRouterRoutes(chainId)

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
  const leverageV2 = {
    hasLeverage: () => true,
    maxLeverage: leverageV2Stubs.maxLeverage,
    borrowMoreHealth: leverageV2Stubs.borrowMoreHealth,
    borrowMoreMaxRecv: leverageV2Stubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: leverageV2Stubs.borrowMoreIsApproved,
    borrowMoreApprove: leverageV2Stubs.borrowMoreApprove,
    borrowMore: leverageV2Stubs.borrowMore,
    borrowMorePrices: leverageV2Stubs.borrowMorePrices,
    borrowMoreExpectedCollateral: leverageV2Stubs.borrowMoreExpectedCollateral,
    borrowMoreFutureLeverage: leverageV2Stubs.borrowMoreFutureLeverage,
    borrowMorePriceImpact: leverageV2Stubs.borrowMorePriceImpact,
    estimateGas: {
      borrowMore: leverageV2Stubs.estimateGasBorrowMore,
      borrowMoreApprove: leverageV2Stubs.estimateGasBorrowMoreApprove,
    },
  }

  const zapV2Expected = {
    metrics: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED, dDebt: borrow, debt: borrow },
    maxRecv: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    isApproved: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    estimateGasApprove: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
    approve: { userCollateral: collateral, userBorrowed: DEFAULT_USER_BORROWED },
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
  const leverageV2Expected = {
    health: [collateral, DEFAULT_USER_BORROWED, borrow] as const,
    maxRecv: [collateral, DEFAULT_USER_BORROWED] as const,
    isApproved: [collateral, DEFAULT_USER_BORROWED] as const,
    estimateGasApprove: [collateral, DEFAULT_USER_BORROWED] as const,
    approve: [collateral, DEFAULT_USER_BORROWED] as const,
    estimateGas: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
    submit: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
    expectedCollateral: [collateral, DEFAULT_USER_BORROWED, borrow, DEFAULT_LEVERAGE_SLIPPAGE] as const,
    futureLeverage: [collateral, DEFAULT_USER_BORROWED, borrow] as const,
    priceImpact: [DEFAULT_USER_BORROWED, borrow] as const,
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
    : useLeverageV2
      ? createMockMintMarket({
          collateral: DEFAULT_COLLATERAL_ADDRESS,
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
      : createMockMintMarket({
          collateral: DEFAULT_COLLATERAL_ADDRESS,
          stats: { parameters: normalStubs.parameters },
          estimateGas: loan.estimateGas,
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
      } else if (useLeverageV2) {
        expect(normalStubs.parameters).to.have.been.calledWithExactly()
        expect(leverageV2Stubs.maxLeverage).to.have.been.called
        expect(leverageV2Stubs.borrowMoreHealth).to.have.been.calledWithExactly(...leverageV2Expected.health)
        expect(leverageV2Stubs.borrowMoreMaxRecv).to.have.been.calledWithExactly(...leverageV2Expected.maxRecv)
        expect(leverageV2Stubs.borrowMoreIsApproved).to.have.been.calledWithExactly(...leverageV2Expected.isApproved)
        expect(leverageV2Stubs.borrowMoreExpectedCollateral).to.have.been.calledWithExactly(
          ...leverageV2Expected.expectedCollateral,
        )
        expect(leverageV2Stubs.borrowMoreFutureLeverage).to.have.been.calledWithExactly(
          ...leverageV2Expected.futureLeverage,
        )
        expect(leverageV2Stubs.borrowMorePriceImpact).to.have.been.calledWithExactly(...leverageV2Expected.priceImpact)
        if (approved) {
          expect(leverageV2Stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(
            ...leverageV2Expected.estimateGas,
          )
          expect(leverageV2Stubs.estimateGasBorrowMoreApprove).to.not.have.been.called
        } else {
          expect(leverageV2Stubs.estimateGasBorrowMoreApprove).to.have.been.calledWithExactly(
            ...leverageV2Expected.estimateGasApprove,
          )
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
      } else if (useLeverageV2) {
        expect(leverageV2Stubs.borrowMore).to.have.been.calledWithExactly(...leverageV2Expected.submit)
        if (approved) {
          expect(leverageV2Stubs.estimateGasBorrowMore).to.have.been.calledWithExactly(
            ...leverageV2Expected.estimateGas,
          )
          expect(leverageV2Stubs.borrowMoreApprove).to.not.have.been.called
        } else {
          expect(leverageV2Stubs.borrowMoreApprove).to.have.been.calledWithExactly(...leverageV2Expected.approve)
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
    repayExpectedMetrics: createStub({
      health: oneDecimal(30, 95, 2),
      prices: [oneDecimal(2500, 4200, 2), oneDecimal(2200, 3900, 2)],
      priceImpact: oneDecimal(0.01, 1, 3),
    }),
    repayIsApproved: approved ? createStub(true) : createIsApprovedStub(repayLeverageApproveStub),
    repayIsAvailable: createStub(true),
    repayIsFull: createStub(false),
    repayApprove: repayLeverageApproveStub,
    repay: createStub(TEST_TX_HASH),
    repayExpectedBorrowed: createStub(expectedBorrowed),
    repayFutureLeverage: createStub(oneDecimal(1.1, 6, 2)),
    calcMinRecv: createSyncStub(ROUTE_MIN_RECV),
  } as const

  if (leverage) mockRouterRoutes(chainId)

  const leverageZapV2 = {
    hasLeverage: () => true,
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
    },
  }

  const leverageExpected = {
    metrics: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      userBorrowed: DEFAULT_USER_BORROWED,
      healthIsFull: true,
      address: TEST_ADDRESS,
      ...routeMeta,
    },
    isApproved: { userCollateral: DEFAULT_USER_BORROWED, userBorrowed: DEFAULT_USER_BORROWED },
    estimateGas: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      userBorrowed: DEFAULT_USER_BORROWED,
      ...routeMutationMeta,
    },
    estimateGasApprove: { userCollateral: DEFAULT_USER_BORROWED, userBorrowed: DEFAULT_USER_BORROWED },
    approve: { userCollateral: DEFAULT_USER_BORROWED, userBorrowed: DEFAULT_USER_BORROWED },
    submit: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      userBorrowed: DEFAULT_USER_BORROWED,
      ...routeMutationMeta,
    },
    expectedBorrowed: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      userBorrowed: DEFAULT_USER_BORROWED,
      ...routeMutationMeta,
    },
    futureLeverage: {
      stateCollateral: collateral,
      userCollateral: DEFAULT_USER_BORROWED,
      userBorrowed: DEFAULT_USER_BORROWED,
      ...routeMutationMeta,
    },
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
        loan,
        leverage: { maxLeverage: createStub(oneDecimal(1.5, 10, 2)) },
        leverageZapV2,
        stats: { parameters: normalStubs.parameters },
        userState: createStub({ collateral, stablecoin: '0', debt: currentDebt }),
        userHealth: createStub(oneDecimal(20, 80, 2)),
      })
    : createMockMintMarket({
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
          expect(leverageStubs.repayExpectedMetrics).to.have.been.calledWithMatch(leverageExpected.metrics)
          expect(leverageStubs.repayIsApproved).to.have.been.calledWithMatch(leverageExpected.isApproved)
          expect(leverageStubs.repayExpectedBorrowed).to.have.been.calledWithMatch(leverageExpected.expectedBorrowed)
          expect(leverageStubs.repayFutureLeverage).to.have.been.calledWithMatch(leverageExpected.futureLeverage)
          if (approved) {
            expect(leverageStubs.estimateGasRepay).to.have.been.calledWithMatch(leverageExpected.estimateGas)
            expect(leverageStubs.estimateGasRepayApprove).to.not.have.been.called
          } else {
            expect(leverageStubs.estimateGasRepayApprove).to.have.been.calledWithMatch(
              leverageExpected.estimateGasApprove,
            )
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
          expect(leverageStubs.estimateGasRepay).to.have.been.calledWithMatch(leverageExpected.estimateGas)
          expect(leverageStubs.repay).to.have.been.calledWithMatch(leverageExpected.submit)
          if (approved) {
            expect(leverageStubs.repayApprove).to.not.have.been.called
          } else {
            expect(leverageStubs.repayApprove).to.have.been.calledWithMatch(leverageExpected.approve)
          }
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
