import type { Address } from 'viem'
import { LEVERAGE } from '@/llamalend/constants'
import { oneAddress, oneDecimal } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import type { RoutesQuery } from '@ui-kit/entities/router-api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { TEST_ADDRESS } from '../mock-loan-test-data'
import { createMockLendMarket, createMockLendStats, createMockMintMarket } from '../mock-market.helpers'
import { seedErc20BalanceForAddresses } from '../query-cache.helpers'
import { createStub, type TestStub, type TestStubArg } from '../test-stub.utils'

/** Seed token balances for both collateral and borrow (crvUSD) tokens so useReadContracts doesn't make real RPC calls */
export const seedMarketBalances = (chainId: number, collateralAddress: Address) => {
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

const generateMarketRates = () => ({
  borrowApr: oneDecimal(0.01, 0.3, 4),
  borrowApy: oneDecimal(0.01, 0.3, 4),
  lendApr: oneDecimal(0.01, 0.1, 4),
  lendApy: oneDecimal(0.01, 0.1, 4),
})

export const oneRatePair = () => ({
  rate: oneDecimal(0.01, 0.2, 4),
  future_rate: oneDecimal(0.01, 0.2, 4),
  rates: generateMarketRates(),
  future_rates: generateMarketRates(),
})

export const oneAprPair = () => ({
  rate: oneDecimal(0.01, 0.3, 4),
  future_rate: oneDecimal(0.01, 0.3, 4),
  rates: generateMarketRates(),
  future_rates: generateMarketRates(),
})

export const DEFAULT_LEVERAGE_SLIPPAGE = Number(SLIPPAGE[LEVERAGE].default)
export const DEFAULT_USER_BORROWED = '0' as const
export const DEFAULT_COLLATERAL_ADDRESS = oneAddress()

const ROUTER_ADDRESS = oneAddress()
const ROUTER_CALLDATA = '0x1234' as const
const ROUTE_AMOUNT_OUT = `${10n ** 18n}` as const
const ROUTE_PRICE_IMPACT = oneDecimal(0.01, 1, 3)
export const ROUTE_MIN_RECV = oneDecimal(0.01, 1, 3)

export const routeMeta = {
  router: ROUTER_ADDRESS,
  calldata: ROUTER_CALLDATA,
  quote: {
    outAmount: ROUTE_AMOUNT_OUT,
    priceImpact: ROUTE_PRICE_IMPACT,
  },
} as const

export const routeMutationMeta = {
  ...routeMeta,
  minRecv: ROUTE_MIN_RECV,
} as const

export const mockRouterRoutes = (chainId: number) => {
  cy.intercept('GET', '**/api/router/v1/routes*', req => {
    const { router, amountIn, tokenIn, tokenOut } = req.query as RoutesQuery
    req.reply({
      statusCode: 200,
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
  }).as('routerRoutes')
}

export const createMockLendLoanMarket = ({
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

export const leverageMetrics = () => ({
  totalCollateral: oneDecimal(1, 4, 3),
  userCollateral: oneDecimal(0.05, 1.2, 3),
  collateralFromUserBorrowed: oneDecimal(0.01, 0.5, 3),
  collateralFromDebt: oneDecimal(0.01, 0.5, 3),
  leverage: oneDecimal(1.1, 6, 2),
  avgPrice: oneDecimal(900, 2300, 2),
})

export const expectedBorrowedMetrics = () => ({
  totalBorrowed: oneDecimal(0.2, 20, 2),
  borrowedFromStateCollateral: oneDecimal(0.01, 0.5, 3),
  borrowedFromUserCollateral: oneDecimal(0.01, 0.5, 3),
  userBorrowed: oneDecimal(0.2, 20, 2),
  avgPrice: oneDecimal(900, 2300, 2),
})

export const createLoanPositionStubs = ({ collateral, debt }: { collateral: Decimal; debt: Decimal }) => ({
  userState: createStub({ collateral, stablecoin: '0', debt }),
  userHealth: createStub(oneDecimal(20, 80, 2)),
})

export const createBorrowMoreMintMarket = ({
  normalStubs,
  expectedCurrentDebt,
  leverageV2,
}: {
  normalStubs: {
    parameters: object
    estimateGasBorrowMore: object
    estimateGasBorrowMoreApprove: object
    borrowMoreHealth: object
    borrowMoreMaxRecv: object
    borrowMoreIsApproved: object
    borrowMoreApprove: object
    borrowMore: object
    borrowMorePrices: object
    loanExists: object
    userPrices: object
  }
  expectedCurrentDebt: Decimal
  leverageV2?: object
}) =>
  createMockMintMarket({
    collateral: DEFAULT_COLLATERAL_ADDRESS,
    ...(leverageV2 && { leverageV2 }),
    stats: { parameters: normalStubs.parameters },
    estimateGas: {
      borrowMore: normalStubs.estimateGasBorrowMore,
      borrowMoreApprove: normalStubs.estimateGasBorrowMoreApprove,
    },
    ...createLoanPositionStubs({ collateral: '1', debt: expectedCurrentDebt }),
    borrowMoreHealth: normalStubs.borrowMoreHealth,
    borrowMoreMaxRecv: normalStubs.borrowMoreMaxRecv,
    borrowMoreIsApproved: normalStubs.borrowMoreIsApproved,
    borrowMoreApprove: normalStubs.borrowMoreApprove,
    borrowMore: normalStubs.borrowMore,
    borrowMorePrices: normalStubs.borrowMorePrices,
    loanExists: normalStubs.loanExists,
    userPrices: normalStubs.userPrices,
  })
