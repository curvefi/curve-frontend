import { RPC } from '@ui-kit/features/connect-wallet/lib/wagmi/rpc'
import { Chain } from '@ui-kit/utils'

export const REFUEL_POOL_ADDRESS = '0x6e5492f8ea2370844ee098a56dd88e1717e4a9c2'

export const REFUEL_API_ALIASES = {
  pools: 'refuelPools',
  timeseries: 'refuelTimeseries',
  daily: 'refuelDaily',
  events: 'refuelEvents',
} as const

const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const DONOR_ADDRESS = '0x1111111111111111111111111111111111111111'

const tokens = [
  { symbol: 'crvUSD', address: CRVUSD_ADDRESS, decimals: 18 },
  { symbol: 'WETH', address: WETH_ADDRESS, decimals: 18 },
]

const poolsResponse = {
  chain: 'ethereum',
  total: {
    total_tvl: 1_000_000,
    trading_volume_24h: 100_000,
    trading_fee_24h: 100,
    liquidity_volume_24h: 50_000,
    liquidity_fee_24h: 50,
  },
  data: [
    {
      name: 'crvUSD/WETH',
      address: REFUEL_POOL_ADDRESS,
      n_coins: 2,
      tvl_usd: 1_000_000,
      trading_volume_24h: 100_000,
      trading_fee_24h: 100,
      liquidity_volume_24h: 50_000,
      liquidity_fee_24h: 50,
      lp_token_address: REFUEL_POOL_ADDRESS,
      lp_token_symbol: 'crvUSD/WETH-f',
      lp_token_supply: 500_000,
      balances: [500_000, 166],
      balances_usd: [500_000, 500_000],
      coins: tokens.map(({ symbol, address }, pool_index) => ({ pool_index, symbol, address })),
      base_daily_apr: 0.01,
      base_weekly_apr: 0.07,
      virtual_price: 1_000_000_000_000_000_000,
      pool_methods: ['donation_shares'],
    },
  ],
}

const timeseriesResponse = {
  count: 2,
  page: 1,
  tokens,
  data: [
    {
      timestamp: 1_760_000_000,
      virtual_price: 1_000_000_000_000_000_000,
      price_scale: [3_000],
      price_oracle: [3_001],
      last_prices: [2_999],
      reserves: [500_000_000_000_000_000_000_000, 166_000_000_000_000_000_000],
      donation_shares: 1_000_000_000_000_000_000_000,
      unlocked_shares: 250_000_000_000_000_000_000,
      lp_usd_price: 1.01,
    },
    {
      timestamp: 1_760_086_400,
      virtual_price: 1_010_000_000_000_000_000,
      price_scale: [3_010],
      price_oracle: [3_011],
      last_prices: [3_009],
      reserves: [510_000_000_000_000_000_000_000, 170_000_000_000_000_000_000],
      donation_shares: 1_100_000_000_000_000_000_000,
      unlocked_shares: 300_000_000_000_000_000_000,
      lp_usd_price: 1.02,
    },
  ],
}

const dailyResponse = {
  data: [{ timestamp: 1_760_086_400, total_usd: 1_234, count: 2 }],
}

const eventsResponse = {
  count: 1,
  page: 1,
  tokens,
  data: [
    {
      timestamp: 1_760_086_400,
      block_number: 23_000_000,
      donor: DONOR_ADDRESS,
      lp_shares_minted: 100,
      usd_value: 500,
      token_amounts: [250, 0.083],
      transaction_hash: `0x${'12'.repeat(32)}`,
    },
  ],
}

type JsonRpcRequest = {
  id: number | string
  method: string
  params?: [{ data?: string }]
}

const contractReadResults: Record<string, string> = {
  '0xa3bdf1b7': '0x00000000000000000000000000000000000000000000003635c9adc5dea00000',
  '0x0decf4a2': '0x0000000000000000000000000000000000000000000000000000000000093a80',
  '0x3d2699f2': '0x000000000000000000000000000000000000000000000000016345785d8a0000',
  '0x313ce567': '0x0000000000000000000000000000000000000000000000000000000000000012',
}

const mockRefuelContractReads = () => {
  RPC[Chain.Ethereum].forEach(url => {
    cy.intercept('POST', url, req => {
      const isBatch = Array.isArray(req.body)
      const calls = (isBatch ? req.body : [req.body]) as JsonRpcRequest[]
      const results = calls.map(call => contractReadResults[call.params?.[0]?.data?.slice(0, 10) ?? ''])

      if (calls.some((call, index) => call.method !== 'eth_call' || !results[index])) return req.continue()

      const responses = calls.map((call, index) => ({ jsonrpc: '2.0', id: call.id, result: results[index] }))
      req.reply({ body: isBatch ? responses : responses[0] })
    })
  })
}

export const setupRefuelMocks = () => {
  cy.intercept('GET', 'https://prices.curve.finance/v1/refuel/**', {
    statusCode: 500,
    body: { error: 'Unexpected Refuel API request' },
  })
  cy.intercept('GET', 'https://prices.curve.finance/v1/refuel/ethereum/pools', poolsResponse).as(
    REFUEL_API_ALIASES.pools,
  )
  cy.intercept(
    'GET',
    `https://prices.curve.finance/v1/refuel/ethereum/${REFUEL_POOL_ADDRESS}/timeseries*`,
    timeseriesResponse,
  ).as(REFUEL_API_ALIASES.timeseries)
  cy.intercept(
    'GET',
    `https://prices.curve.finance/v1/refuel/ethereum/${REFUEL_POOL_ADDRESS}/donations/daily*`,
    dailyResponse,
  ).as(REFUEL_API_ALIASES.daily)
  cy.intercept(
    'GET',
    `https://prices.curve.finance/v1/refuel/ethereum/${REFUEL_POOL_ADDRESS}/donations/events*`,
    eventsResponse,
  ).as(REFUEL_API_ALIASES.events)
  mockRefuelContractReads()
}
