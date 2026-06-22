import { orderBy } from 'lodash'
import {
  POOL_LIST_CRYPTO_POOL_TYPE_ALIASES,
  POOL_LIST_POOL_TYPES,
  POOL_LIST_SORT_FIELDS,
} from '@/dex/features/pool-list/poolList.constants'
import type { PoolType, SortDirection, V2PoolSortField } from '@curvefi/prices-api/pools'
import type { Address } from '@primitives/address.utils'
import { range } from '@primitives/objects.utils'

const ChainId = {
  Ethereum: 1,
  Arbitrum: 42161,
} as const

// Large enough to exercise pagination controls and page-number truncation.
const POOL_COUNT = 500

// Known Ethereum pool used by search assertions.
const SearchPool = {
  name: '3pool',
  address: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7' as Address,
} as const

export const DEX_POOL_LIST_NAVIGATION_POOL = {
  name: '2pool',
  address: '0x7f90122bf0700f9e7e1f688fe926940e8839f353' as Address,
  network: 'arbitrum',
} as const

type PoolListQuery = {
  chainId: number
  page: number
  pagination: number
  search: string
  poolType: string | null
  sortBy: V2PoolSortField
  sortDirection: SortDirection
}

const mockAddress = (chainId: number, index: number, offset = 0): Address =>
  `0x${(BigInt(chainId) * 1_000_000n + BigInt(index) * 10n + BigInt(offset)).toString(16).padStart(40, '0')}`

const createCoins = (chainId: number, index: number) =>
  range(2).map(poolIndex => ({
    pool_index: poolIndex,
    symbol: `MOCK${poolIndex + 1}`,
    address: mockAddress(chainId, index, poolIndex + 1),
    name: `Mock Token ${poolIndex + 1}`,
    decimals: 18,
  }))

const createPool = ({
  address,
  chainId,
  index,
  name,
  poolType,
}: {
  address?: Address
  chainId: number
  index: number
  name?: string
  poolType?: PoolType
}) => ({
  chain_id: chainId,
  name: name ?? `Mock Pool ${chainId}-${index.toString().padStart(3, '0')}`,
  address: address ?? mockAddress(chainId, index),
  pool_type: poolType ?? POOL_LIST_POOL_TYPES[index % POOL_LIST_POOL_TYPES.length],
  is_metapool: false,
  base_pool: null,
  tvl_usd: 1_000_000 + index * 1_000_000,
  trading_volume_24h: 1_000_000_000 - index * 1_000_000,
  trading_fee_24h: 1_000 + index,
  liquidity_volume_24h: 10_000 + index,
  liquidity_fee_24h: 100 + index,
  coins: createCoins(chainId, index),
  base_daily_apr: (index % 50) / 1_000,
  base_weekly_apr: (index % 50) / 900,
  crv_apr: null,
  crv_apr_boosted: null,
  extra_rewards_apr: [],
  vyper_version: null,
  gauges: [],
})

type MockPool = ReturnType<typeof createPool>

const createMockPools = (chainId: number): MockPool[] => [
  ...(chainId === ChainId.Ethereum
    ? [
        {
          ...createPool({
            address: SearchPool.address,
            chainId,
            index: POOL_COUNT,
            name: SearchPool.name,
            poolType: 'main',
          }),
          coins: [
            {
              pool_index: 0,
              symbol: 'DAI',
              address: '0x6b175474e89094c44da98b954eedeac495271d0f' as Address,
              name: 'Dai Stablecoin',
              decimals: 18,
            },
            {
              pool_index: 1,
              symbol: 'USDC',
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as Address,
              name: 'USD Coin',
              decimals: 6,
            },
            {
              pool_index: 2,
              symbol: 'USDT',
              address: '0xdac17f958d2ee523a2206206994597c13d831ec7' as Address,
              name: 'Tether USD',
              decimals: 6,
            },
          ],
        },
      ]
    : []),
  ...(chainId === ChainId.Arbitrum
    ? [
        {
          ...createPool({
            address: DEX_POOL_LIST_NAVIGATION_POOL.address,
            chainId,
            index: POOL_COUNT + 1,
            name: DEX_POOL_LIST_NAVIGATION_POOL.name,
            poolType: 'main',
          }),
          tvl_usd: 2_000_000_000,
          trading_volume_24h: 2_000_000_000,
          coins: [
            {
              pool_index: 0,
              symbol: 'USDC',
              address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8' as Address,
              name: 'USD Coin',
              decimals: 6,
            },
            {
              pool_index: 1,
              symbol: 'USDT',
              address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' as Address,
              name: 'Tether USD',
              decimals: 6,
            },
          ],
        },
      ]
    : []),
  ...range(POOL_COUNT).map(index => createPool({ chainId, index })),
]

const MOCK_POOLS = [...createMockPools(ChainId.Ethereum), ...createMockPools(ChainId.Arbitrum)]

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const isOneOf = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value != null && (values as readonly string[]).includes(value)

const parseSortBy = (value: string | null): V2PoolSortField => (isOneOf(POOL_LIST_SORT_FIELDS, value) ? value : 'tvl')

const parsePoolListQuery = (url: URL): PoolListQuery => ({
  chainId: Number(url.searchParams.get('chain_id')),
  page: parsePositiveInt(url.searchParams.get('page'), 1),
  pagination: parsePositiveInt(url.searchParams.get('pagination'), 50),
  search: url.searchParams.get('search_string')?.toLowerCase() ?? '',
  poolType: url.searchParams.get('pool_type'),
  sortBy: parseSortBy(url.searchParams.get('sort_by')),
  sortDirection: url.searchParams.get('sort_direction') === 'asc' ? 'asc' : 'desc',
})

const getSortValue = (pool: MockPool, sortBy: V2PoolSortField) =>
  ({
    name: pool.name.toLowerCase(),
    base_daily_apr: pool.base_daily_apr,
    volume: pool.trading_volume_24h,
    tvl: pool.tvl_usd,
  })[sortBy]

const matchesPoolType = (pool: MockPool, poolType: string | null) =>
  !poolType ||
  pool.pool_type === poolType ||
  (poolType === 'crypto' && POOL_LIST_CRYPTO_POOL_TYPE_ALIASES.has(pool.pool_type))

const matchesSearch = (pool: MockPool, search: string) =>
  !search ||
  [pool.name, pool.address, ...pool.coins.flatMap(({ symbol, address }) => [symbol, address])].some(value =>
    value.toLowerCase().includes(search),
  )

const getPoolListResponse = (query: PoolListQuery) => {
  const filtered = orderBy(
    MOCK_POOLS.filter(pool => pool.chain_id === query.chainId)
      .filter(pool => matchesPoolType(pool, query.poolType))
      .filter(pool => matchesSearch(pool, query.search)),
    pool => getSortValue(pool, query.sortBy),
    query.sortDirection,
  )
  const start = (query.page - 1) * query.pagination

  return {
    page: query.page,
    pagination: query.pagination,
    count: filtered.length,
    pools: filtered.slice(start, start + query.pagination),
  }
}

export const mockDexPoolChains = () =>
  cy.intercept(
    { method: 'GET', hostname: 'prices.curve.finance', pathname: '/v2/pools/chains/' },
    {
      body: {
        data: [
          { chain_id: ChainId.Ethereum, name: 'ethereum' },
          { chain_id: ChainId.Arbitrum, name: 'arbitrum' },
        ],
      },
    },
  )

export const mockDexPoolList = () =>
  cy.intercept({ method: 'GET', hostname: 'prices.curve.finance', pathname: '/v2/pools/' }, req => {
    req.reply({ body: getPoolListResponse(parsePoolListQuery(new URL(req.url))) })
  })

// Keep DEX pool-list tests deterministic by failing on any prices API endpoint this helper does not own.
const blockUnmockedDexPoolListApis = () =>
  cy.intercept({ method: 'GET', hostname: 'prices.curve.finance', pathname: /^\/v2\/pools(?:\/.*)?$/ }, req => {
    req.reply({ statusCode: 503, body: { error: `Unexpected DEX pool list API request: ${req.url}` } })
  })

export const setupDexPoolListMocks = () => {
  blockUnmockedDexPoolListApis()
  mockDexPoolChains().as('dex-pool-chains')
  mockDexPoolList().as('dex-pools')
}

export const DEX_POOL_LIST_SEARCH = SearchPool.name
