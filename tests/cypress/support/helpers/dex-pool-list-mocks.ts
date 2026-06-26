import { orderBy } from 'lodash'
import {
  POOL_LIST_CRYPTO_POOL_TYPE_ALIASES,
  POOL_LIST_POOL_TYPES,
  POOL_LIST_SORT_FIELDS,
} from '@/dex/features/pool-list/poolList.constants'
import type { PoolType, SortDirection, V2PoolSortField } from '@curvefi/prices-api/pools'
import { oneAddress, oneFloat } from '@cy/support/generators'
import { oneToken } from '@cy/support/helpers/tokens'
import type { Address } from '@primitives/address.utils'
import { maybe, range } from '@primitives/objects.utils'
import { Chain, requireBlockchainId } from '@ui-kit/utils/network'

const MOCK_CHAIN_IDS = [Chain.Ethereum, Chain.Arbitrum] as const
type MockChainId = (typeof MOCK_CHAIN_IDS)[number]

// Large enough to exercise pagination controls and page-number truncation.
const POOL_COUNT = 500
const MAX_GENERATED_POOL_VOLUME_USD = 1_000_000_000
const POOL_USD_STEP = 1_000_000
const DAY_SECONDS = 24 * 60 * 60
const MOCK_POOL_CREATION_START_SECONDS = Date.UTC(2024, 0, 1) / 1000
const onePriorityPoolUsdValue = () =>
  oneFloat(MAX_GENERATED_POOL_VOLUME_USD + POOL_USD_STEP, MAX_GENERATED_POOL_VOLUME_USD * 2)

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
  minTvl: number | undefined
  maxTvl: number | undefined
  minVolume: number | undefined
  maxVolume: number | undefined
  minApy: number | undefined
  maxApy: number | undefined
  minCreationDate: number | undefined
  maxCreationDate: number | undefined
  sortBy: V2PoolSortField
  sortDirection: SortDirection
}

const createCoins = (chainId: MockChainId) => {
  const blockchainId = requireBlockchainId(chainId)

  return range(2).map(poolIndex => {
    const { address, symbol } = oneToken(blockchainId)

    return {
      pool_index: poolIndex,
      symbol,
      address,
      name: symbol,
      decimals: 18,
    }
  })
}

const createPool = ({
  address,
  chainId,
  index,
  name,
  poolType,
}: {
  address?: Address
  chainId: MockChainId
  index: number
  name?: string
  poolType?: PoolType
}) => ({
  chain_id: Number(chainId),
  name: name ?? `Mock Pool ${chainId}-${index.toString().padStart(3, '0')}`,
  address: address ?? oneAddress(),
  pool_type: poolType ?? POOL_LIST_POOL_TYPES[index % POOL_LIST_POOL_TYPES.length],
  is_metapool: false,
  base_pool: null,
  creation_ts: MOCK_POOL_CREATION_START_SECONDS + index * DAY_SECONDS,
  tvl_usd: POOL_USD_STEP + index * POOL_USD_STEP,
  trading_volume_24h: MAX_GENERATED_POOL_VOLUME_USD - index * POOL_USD_STEP,
  trading_fee_24h: 1_000 + index,
  liquidity_volume_24h: 10_000 + index,
  liquidity_fee_24h: 100 + index,
  coins: createCoins(chainId),
  base_daily_apr: (index % 50) / 1_000,
  base_weekly_apr: (index % 50) / 900,
  crv_apr: null,
  crv_apr_boosted: null,
  extra_rewards_apr: [],
  vyper_version: null,
  gauges: [],
})

type MockPool = ReturnType<typeof createPool>

// Hardcode known pools where tests need exact search text, or a real address because
// generated addresses do not resolve on the pool detail page.
const createMockPools = (chainId: MockChainId): MockPool[] => [
  ...(chainId === Chain.Ethereum
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
  ...(chainId === Chain.Arbitrum
    ? [
        {
          ...createPool({
            address: DEX_POOL_LIST_NAVIGATION_POOL.address,
            chainId,
            index: POOL_COUNT + 1,
            name: DEX_POOL_LIST_NAVIGATION_POOL.name,
            poolType: 'main',
          }),
          tvl_usd: onePriorityPoolUsdValue(),
          trading_volume_24h: onePriorityPoolUsdValue(),
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

const MOCK_POOLS = MOCK_CHAIN_IDS.flatMap(createMockPools)

const parseOptionalNumberParam = (value: string | null) => {
  const parsed = maybe(value, Number)

  return parsed != null && Number.isFinite(parsed) ? parsed : undefined
}

const parseNumberParam = (value: string | null, fallback: number) => parseOptionalNumberParam(value) ?? fallback

const isOneOf = <T extends string>(values: readonly T[], value: string | null): value is T =>
  value != null && (values as readonly string[]).includes(value)

const parseSortBy = (value: string | null): V2PoolSortField => (isOneOf(POOL_LIST_SORT_FIELDS, value) ? value : 'tvl')

const parsePoolListQuery = (url: URL): PoolListQuery => ({
  chainId: Number(url.searchParams.get('chain_id')),
  page: parseNumberParam(url.searchParams.get('page'), 1),
  pagination: parseNumberParam(url.searchParams.get('pagination'), 50),
  search: url.searchParams.get('search_string')?.toLowerCase() ?? '',
  poolType: url.searchParams.get('pool_type'),
  minTvl: parseOptionalNumberParam(url.searchParams.get('min_tvl')),
  maxTvl: parseOptionalNumberParam(url.searchParams.get('max_tvl')),
  minVolume: parseOptionalNumberParam(url.searchParams.get('min_volume')),
  maxVolume: parseOptionalNumberParam(url.searchParams.get('max_volume')),
  minApy: parseOptionalNumberParam(url.searchParams.get('min_apy')),
  maxApy: parseOptionalNumberParam(url.searchParams.get('max_apy')),
  minCreationDate: parseOptionalNumberParam(url.searchParams.get('min_creation_date')),
  maxCreationDate: parseOptionalNumberParam(url.searchParams.get('max_creation_date')),
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

const matchesRange = (value: number, min: number | undefined, max: number | undefined) =>
  (min == null || value >= min) && (max == null || value <= max)

const getPoolListResponse = (query: PoolListQuery) => {
  const filtered = orderBy(
    MOCK_POOLS.filter(pool => pool.chain_id === query.chainId)
      .filter(pool => matchesPoolType(pool, query.poolType))
      .filter(pool => matchesSearch(pool, query.search))
      .filter(pool => matchesRange(pool.tvl_usd, query.minTvl, query.maxTvl))
      .filter(pool => matchesRange(pool.trading_volume_24h, query.minVolume, query.maxVolume))
      .filter(pool => matchesRange(pool.base_daily_apr, query.minApy, query.maxApy))
      .filter(pool => matchesRange(pool.creation_ts, query.minCreationDate, query.maxCreationDate)),
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
        data: MOCK_CHAIN_IDS.map(chainId => ({ chain_id: chainId, name: requireBlockchainId(chainId) })),
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
