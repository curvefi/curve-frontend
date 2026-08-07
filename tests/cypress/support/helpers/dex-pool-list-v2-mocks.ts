import { orderBy } from 'lodash'
import type { PoolType } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@ui-kit/utils/network'

type V2PoolNetwork = 'ethereum' | 'taiko'

type RawV2Pool = {
  chain_id: number
  name: string
  address: Address
  creation_date: number | null
  pool_type: PoolType | null
  is_metapool: boolean
  base_pool: Address | null
  tvl_usd: number
  trading_volume_24h: number
  trading_fee_24h: number
  liquidity_volume_24h: number
  liquidity_fee_24h: number
  coins: {
    pool_index: number
    symbol: string
    address: Address
    name: string
    decimals: number
  }[]
  base_daily_apr: number | null
  base_weekly_apr: number | null
  crv_apr: number | null
  crv_apr_boosted: number | null
  extra_rewards_apr: {
    address: Address
    symbol: string
    name: string
    decimals: number
    price: number
    apr: number
  }[]
  vyper_version: string | null
  gauges: { address: Address; is_killed: boolean }[]
}

type V2PoolFixture = RawV2Pool & { network: V2PoolNetwork }

type RawLitePool = {
  id: string
  chain_id: number
  address: Address
  registry_id: string
  name: string | null
  tvl: number
  coins: {
    address: Address
    decimals?: string | null
    symbol?: string | null
  }[]
  gauge_address?: Address | null
  gauge_crv_apy?: number[] | null
  gauge_extra_rewards?: {
    gauge_address: Address
    token_address: Address
    name: string
    symbol: string
    decimals: string
    apy_data: {
      is_reward_still_active: boolean
      rate: number
      total_supply: number
    }
    apy?: number | null
    meta_data: { rate: string; period_finish: number }
  }[]
}

const address = (suffix: string): Address => `0x${suffix.padStart(40, '0')}`
const EXTRA_REWARD_ADDRESS = address('3001')
const ALERT_TOKEN_ADDRESS: Address = '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d'
const MOCK_ICON = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22/%3E'
const MINUTE_SECONDS = 60
const DAY_SECONDS = 24 * 60 * 60
const YEAR_SECONDS = 365 * DAY_SECONDS

export const V2_POOL_FIXTURE_NOW = Date.UTC(2026, 0, 16, 12)
const V2_POOL_FIXTURE_NOW_SECONDS = V2_POOL_FIXTURE_NOW / 1000

const createCoins = (network: V2PoolNetwork): RawV2Pool['coins'] => [
  {
    pool_index: 0,
    symbol: 'USDC',
    address: network === 'ethereum' ? '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' : address('4001'),
    name: 'USD Coin',
    decimals: 6,
  },
  {
    pool_index: 1,
    symbol: 'USDT',
    address: network === 'ethereum' ? '0xdac17f958d2ee523a2206206994597c13d831ec7' : address('4002'),
    name: 'Tether USD',
    decimals: 6,
  },
]

const createLiteCoins = (): RawLitePool['coins'] => [
  {
    address: address('4001'),
    decimals: '6',
    symbol: 'USDC',
  },
  {
    address: address('4002'),
    decimals: '6',
    symbol: 'USDT',
  },
]

const extraReward = (apr: number, symbol = 'RWD'): RawV2Pool['extra_rewards_apr'][number] => ({
  address: EXTRA_REWARD_ADDRESS,
  symbol,
  name: `${symbol} reward`,
  decimals: 18,
  price: 1,
  apr,
})

const liteExtraReward = (
  apy: number,
  symbol = 'LITE',
): NonNullable<RawLitePool['gauge_extra_rewards']>[number] => ({
  gauge_address: address('2007'),
  token_address: EXTRA_REWARD_ADDRESS,
  name: `${symbol} reward`,
  symbol,
  decimals: '18',
  apy_data: {
    is_reward_still_active: true,
    rate: 1,
    total_supply: 1,
  },
  apy,
  meta_data: { rate: '1', period_finish: V2_POOL_FIXTURE_NOW_SECONDS + YEAR_SECONDS },
})

const createPoolFixture = ({
  address: poolAddress,
  name,
  network = 'ethereum',
  ...overrides
}: Pick<RawV2Pool, 'address' | 'name'> & Partial<RawV2Pool> & { network?: V2PoolNetwork }): V2PoolFixture => ({
  chain_id: network === 'ethereum' ? Chain.Ethereum : Chain.Taiko,
  name,
  address: poolAddress,
  creation_date: V2_POOL_FIXTURE_NOW_SECONDS - 4 * MINUTE_SECONDS,
  pool_type: 'main',
  is_metapool: false,
  base_pool: null,
  tvl_usd: 10_000_000,
  trading_volume_24h: 1_000_000,
  trading_fee_24h: 1_000,
  liquidity_volume_24h: 100_000,
  liquidity_fee_24h: 100,
  coins: createCoins(network),
  base_daily_apr: 1,
  base_weekly_apr: 1,
  crv_apr: null,
  crv_apr_boosted: null,
  extra_rewards_apr: [],
  vyper_version: null,
  gauges: [],
  ...overrides,
  network,
})

const createLitePoolFixture = ({
  address: poolAddress,
  name,
  ...overrides
}: Pick<RawLitePool, 'address' | 'name'> & Partial<RawLitePool>): RawLitePool => ({
  id: `factory_stable_ng-${poolAddress.slice(-4)}`,
  chain_id: Chain.Taiko,
  address: poolAddress,
  registry_id: 'factory_stable_ng',
  name,
  tvl: 10_000,
  coins: createLiteCoins(),
  ...overrides,
})

const FULL_V2_POOL_FIXTURES = {
  showcase: createPoolFixture({
    address: '0x6c5ff8dce52be77b4ece6b51996018f0c1713ba9',
    name: 'V2 Rewards Showcase',
    creation_date: V2_POOL_FIXTURE_NOW_SECONDS - 5 * DAY_SECONDS,
    pool_type: 'main',
    is_metapool: true,
    base_daily_apr: 10,
    base_weekly_apr: 20,
    crv_apr: 5,
    crv_apr_boosted: 12.5,
    extra_rewards_apr: [extraReward(2)],
    gauges: [{ address: address('2001'), is_killed: false }],
    trading_volume_24h: 6_000_000,
  }),
  alerts: createPoolFixture({
    address: '0x516c3ecfe45f0820653e08dd7c93633d71b93cb5',
    name: 'V2 Alert Badges',
    is_metapool: true,
    coins: createCoins('ethereum').map((coin, index) =>
      index === 0 ? { ...coin, symbol: 'renBTC', address: ALERT_TOKEN_ADDRESS, name: 'renBTC', decimals: 8 } : coin,
    ),
    gauges: [{ address: address('2008'), is_killed: true }],
    trading_volume_24h: 5_500_000,
  }),
  killed: createPoolFixture({
    address: address('1002'),
    name: 'V2 Killed Gauge',
    creation_date: null,
    crv_apr: 5,
    crv_apr_boosted: 12.5,
    extra_rewards_apr: [extraReward(2, 'KILL')],
    gauges: [{ address: address('2002'), is_killed: true }],
    trading_volume_24h: 5_000_000,
  }),
  partial: createPoolFixture({
    address: address('1003'),
    name: 'V2 Partial Gauge',
    crv_apr: 5,
    crv_apr_boosted: null,
    gauges: [{ address: address('2003'), is_killed: false }],
    trading_volume_24h: 4_000_000,
  }),
  empty: createPoolFixture({
    address: address('1004'),
    name: 'V2 Empty Yield',
    base_daily_apr: 0,
    base_weekly_apr: null,
    crv_apr: 0,
    crv_apr_boosted: null,
    extra_rewards_apr: [extraReward(0, 'ZERO')],
    creation_date: V2_POOL_FIXTURE_NOW_SECONDS - 5 * MINUTE_SECONDS,
    trading_volume_24h: 3_000_000,
  }),
  volatile: createPoolFixture({
    address: address('1005'),
    name: 'V2 Volatile Base',
    pool_type: 'crypto',
    base_daily_apr: 500,
    base_weekly_apr: -10,
    creation_date: V2_POOL_FIXTURE_NOW_SECONDS - 7 * DAY_SECONDS,
    trading_volume_24h: 2_000_000,
  }),
  highRewards: createPoolFixture({
    address: address('1006'),
    name: 'V2 High Rewards',
    extra_rewards_apr: [extraReward(500, 'HIGH')],
    creation_date: V2_POOL_FIXTURE_NOW_SECONDS - 2 * YEAR_SECONDS,
    trading_volume_24h: 0,
    tvl_usd: 0,
  }),
} as const satisfies Record<string, V2PoolFixture>

const LITE_POOL_SHOWCASE = createLitePoolFixture({
  address: address('1007'),
  name: 'V2 Taiko Lite',
  tvl: 10_000_000,
  gauge_address: address('2007'),
  gauge_crv_apy: [5.12, 13.3],
  gauge_extra_rewards: [liteExtraReward(2.02)],
})

const LITE_POOL_LOW_TVL = createLitePoolFixture({
  address: address('1009'),
  name: 'V2 Low TVL',
  tvl: 1,
})

const LITE_POOL_FIXTURES = [LITE_POOL_SHOWCASE, LITE_POOL_LOW_TVL]

export const V2_POOL_FIXTURES = {
  ...FULL_V2_POOL_FIXTURES,
  lite: LITE_POOL_SHOWCASE,
  liteLowTvl: LITE_POOL_LOW_TVL,
} as const

type MerklOpportunityParams = {
  identifier: string
  pool: Pick<RawLitePool | V2PoolFixture, 'address' | 'chain_id' | 'name'>
  apr: number
  symbol: string
  platform: string
  tokenAddress?: Address
}

const createMerklOpportunity = ({
  identifier,
  pool,
  apr,
  symbol,
  platform,
  tokenAddress = address(identifier.replace(/\D/g, '') || '5000'),
}: MerklOpportunityParams) => ({
  type: 'POOL',
  identifier,
  name: `${platform} campaign`,
  description: `${platform} rewards for providing liquidity.`,
  howToSteps: [`Provide liquidity to ${pool.name}.`],
  action: 'POOL',
  apr,
  explorerAddress: pool.address,
  tags: [platform],
  chain: {
    id: pool.chain_id,
    name: pool.chain_id === Number(Chain.Ethereum) ? 'Ethereum' : 'Taiko',
  },
  rewardsRecord: {
    breakdowns: [
      {
        token: {
          chainId: pool.chain_id,
          address: tokenAddress,
          symbol,
          icon: MOCK_ICON,
        },
        value: 100,
      },
    ],
  },
})

const DEX_MERKL_OPPORTUNITIES = [
  createMerklOpportunity({
    identifier: 'v2-apr-1',
    pool: V2_POOL_FIXTURES.showcase,
    apr: 3,
    symbol: 'RWD',
    platform: 'V2 APR',
    tokenAddress: EXTRA_REWARD_ADDRESS,
  }),
  createMerklOpportunity({
    identifier: 'v2-points-1',
    pool: V2_POOL_FIXTURES.showcase,
    apr: 0,
    symbol: '',
    platform: 'V2 Points',
  }),
  createMerklOpportunity({
    identifier: 'v2-points-2',
    pool: V2_POOL_FIXTURES.showcase,
    apr: 0,
    symbol: 'XP',
    platform: 'V2 XP',
  }),
  createMerklOpportunity({
    identifier: 'v2-points-3',
    pool: V2_POOL_FIXTURES.showcase,
    apr: 0,
    symbol: 'STAR',
    platform: 'V2 Stars',
  }),
  createMerklOpportunity({
    identifier: 'v2-killed-apr-1',
    pool: V2_POOL_FIXTURES.killed,
    apr: 3,
    symbol: 'KAPR',
    platform: 'V2 Killed APR',
  }),
  createMerklOpportunity({
    identifier: 'v2-killed-points-1',
    pool: V2_POOL_FIXTURES.killed,
    apr: 0,
    symbol: 'KP',
    platform: 'V2 Killed Points',
  }),
  createMerklOpportunity({
    identifier: 'v2-lite-apr-1',
    pool: V2_POOL_FIXTURES.lite,
    apr: 6,
    symbol: 'TAPR',
    platform: 'V2 Taiko APR',
  }),
  createMerklOpportunity({
    identifier: 'v2-lite-points-1',
    pool: V2_POOL_FIXTURES.lite,
    apr: 0,
    symbol: 'TP',
    platform: 'V2 Taiko Points',
  }),
]

const getRawPool = ({ network: _, ...pool }: V2PoolFixture): RawV2Pool => pool

const getPoolSortValue = (pool: V2PoolFixture, sortBy: string | null) => {
  switch (sortBy) {
    case 'name':
      return pool.name.toLowerCase()
    case 'aggregate_apr':
      return (
        (pool.base_daily_apr ?? 0) +
        (pool.crv_apr ?? 0) +
        pool.extra_rewards_apr.reduce((total, { apr }) => total + apr, 0)
      )
    case 'base_daily_apr':
      return pool.base_daily_apr ?? 0
    case 'crv_apr':
      return pool.crv_apr ?? 0
    case 'volume':
      return pool.trading_volume_24h
    default:
      return pool.tvl_usd
  }
}

const mockPoolChains = () =>
  cy.intercept(
    { method: 'GET', hostname: 'prices.curve.finance', pathname: '/v2/pools/chains/' },
    {
      body: {
        data: [{ chain_id: Chain.Ethereum, name: 'ethereum' }],
      },
    },
  )

const mockPoolList = () =>
  cy.intercept({ method: 'GET', hostname: 'prices.curve.finance', pathname: '/v2/pools/' }, req => {
    const url = new URL(req.url)
    const chainId = Number(url.searchParams.get('chain_id'))
    const search = url.searchParams.get('search_string')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const pagination = Number(url.searchParams.get('pagination') ?? 50)
    const sortBy = url.searchParams.get('sort_by')
    const sortDirection = url.searchParams.get('sort_direction') === 'asc' ? 'asc' : 'desc'
    const matching = orderBy(
      Object.values(FULL_V2_POOL_FIXTURES)
        .filter(pool => pool.chain_id === chainId)
        .filter(
          pool =>
            !search ||
            [pool.address, pool.name, ...pool.coins.flatMap(coin => [coin.address, coin.symbol])].some(value =>
              value.toLowerCase().includes(search),
            ),
        ),
      pool => getPoolSortValue(pool, sortBy),
      sortDirection,
    )
    const start = (page - 1) * pagination

    req.reply({
      body: {
        page,
        pagination,
        count: matching.length,
        pools: matching.slice(start, start + pagination).map(getRawPool),
      },
    })
  })

const mockLitePoolList = () =>
  cy.intercept(
    { method: 'GET', hostname: 'api2.curve.finance', pathname: `/get_pools/${Chain.Taiko}` },
    {
      body: {
        success: true,
        data: {
          pool_data: LITE_POOL_FIXTURES,
          tvl: LITE_POOL_FIXTURES.reduce((total, pool) => total + pool.tvl, 0),
        },
        generated_time_ms: V2_POOL_FIXTURE_NOW,
      },
    },
  )

const mockPlatforms = () =>
  cy.intercept(
    { method: 'GET', hostname: 'api-core.curve.finance', pathname: '/v1/getPlatforms' },
    {
      body: {
        data: {
          platforms: { taiko: {} },
          platformsMetadata: {
            taiko: {
              name: 'Taiko',
              rpcUrl: 'https://rpc.mainnet.taiko.xyz',
              nativeCurrencySymbol: 'ETH',
              explorerBaseUrl: 'https://taikoscan.io/',
              isMainnet: true,
              chainId: Chain.Taiko,
            },
          },
        },
      },
    },
  )

const mockBootstrapRequests = () => {
  cy.intercept(
    { method: 'GET', hostname: 'prices.curve.finance', pathname: '/v1/chains/' },
    {
      body: {
        data: [
          { name: 'ethereum', pool_tvl: 0, lending_tvl: 0 },
          { name: 'taiko', pool_tvl: 0, lending_tvl: 0 },
        ],
      },
    },
  ).as('dex-v2-prices-chains')
  cy.intercept(
    { method: 'GET', hostname: 'prices.curve.finance', pathname: '/v1/chains/pool_filters' },
    { body: { data: [] } },
  ).as('dex-v2-pool-filters')
  cy.intercept(
    { method: 'GET', url: /^https:\/\/api(?:-core)?\.curve\.finance\/v1\/getHiddenPools(?:\?.*)?$/ },
    { body: { success: true, data: {} } },
  ).as('dex-v2-hidden-pools')
}

const mockMerklOpportunities = () =>
  cy.intercept({ method: 'GET', pathname: '/api/merkl/v1/opportunities' }, req => {
    const protocol = new URL(req.url).searchParams.get('mainProtocolId')

    if (protocol === 'curve') {
      req.alias = 'dex-v2-merkl-curve'
      req.reply({ body: DEX_MERKL_OPPORTUNITIES })
      return
    }
    if (protocol === 'llamalend') {
      req.alias = 'dex-v2-merkl-llamalend'
      req.reply({ body: [] })
      return
    }

    req.reply({ statusCode: 503, body: { error: `Unexpected Merkl request: ${req.url}` } })
  })

export const setupDexPoolListV2Mocks = () => {
  cy.intercept({ method: 'GET', hostname: 'prices.curve.finance', pathname: /^\/v2\/pools(?:\/.*)?$/ }, req => {
    req.reply({ statusCode: 503, body: { error: `Unexpected V2 pool-list request: ${req.url}` } })
  })
  cy.intercept({ method: 'GET', hostname: 'api2.curve.finance', pathname: /^\/get_pools\/\d+$/ }, req => {
    req.reply({ statusCode: 503, body: { error: `Unexpected API2 pool-list request: ${req.url}` } })
  })
  mockPoolChains().as('dex-v2-pool-chains')
  mockPoolList().as('dex-v2-pools')
  mockLitePoolList().as('dex-v2-lite-pools')
  mockPlatforms().as('dex-v2-platforms')
  mockBootstrapRequests()
  mockMerklOpportunities()
}
