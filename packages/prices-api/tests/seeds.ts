/** Discovers reproducible live endpoint parameters for schema tests. */
import { beforeAll } from 'vitest'
import type { Address } from '@primitives/address.utils'
import type { Chain, Options } from '../src'
import * as chains from '../src/chains'
import * as crvusd from '../src/crvusd'
import * as dao from '../src/dao'
import * as gauge from '../src/gauge'
import * as llamalend from '../src/llamalend'
import * as pools from '../src/pools'
import * as proposal from '../src/proposal'
import * as refuel from '../src/refuel'
import * as savings from '../src/savings'
import * as yieldBasis from '../src/yield-basis'
import { getEndpointCatalogSkipReason } from './catalog'
import { createFetchTracker, formatTrackedFetchUrls } from './fetch-tracker'

interface PoolSeed {
  chain: Chain
  mainToken: Address
  poolAddress: Address
  referenceToken: Address
}

interface MarketSeed {
  chain: Chain
  controller: Address
  llamma: Address
}

type LlamalendMarketSeed = MarketSeed & {
  vault: Address
}

type MarketUserSeed = MarketSeed & {
  user: Address
}

type LlamalendUserSeed = LlamalendMarketSeed & {
  user: Address
}

interface RefuelPoolSeed {
  chain: Chain
  poolAddress: Address
}

const preferredChain: Chain = 'ethereum'
const pricesApiHost = process.env.PRICES_API_HOST
/** Active deterministic seed; set `PRICES_API_TEST_SEED` to replay random live selections. */
export const endpointTestSeed = process.env.PRICES_API_TEST_SEED ?? `${Date.now()}-${Math.random()}`

/** Optional host override so endpoint tests can target another Prices API deployment. */
export const requestOptions: Options | undefined = pricesApiHost ? { host: pricesApiHost } : undefined

/** Loads a seed in `beforeAll` and returns a getter that fails only in cases that use it. */
export const endpointSeed = <T>(load: () => Promise<T>) => {
  let value: T | undefined
  let error: Error | undefined

  beforeAll(async () => {
    if (getEndpointCatalogSkipReason()) {
      return
    }

    const fetchTracker = createFetchTracker()

    try {
      value = await fetchTracker.run(load)
    } catch (seedError) {
      error = new Error(
        `Failed to load live seed from ${load.name || 'endpointSeed'}\n\n${seedError instanceof Error ? seedError.message : String(seedError)}\n\nPRICES_API_TEST_SEED=${endpointTestSeed}\n\nSeed URL:\n${formatTrackedFetchUrls(fetchTracker.urls)}`,
        { cause: error },
      )
    }
  })

  return () => {
    if (error) {
      throw error
    }

    return requireSeed(value, load.name || 'endpointSeed')
  }
}

const once = <T>(load: () => Promise<T>) => {
  let promise: Promise<T> | undefined
  return () => (promise ??= load())
}

const requireSeed = <T>(value: T | null | undefined, source: string): T =>
  value ??
  (() => {
    throw new Error(`Missing live seed from ${source}`)
  })()

/** Hashes string seeds into a 32-bit starting state for the replayable PRNG. */
const hashSeed = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

let randomState = hashSeed(endpointTestSeed)

/** Deterministic PRNG used instead of `Math.random()` so live selections can be replayed. */
const random = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
  return randomState / 0x100000000
}

const randomIndex = (length: number) => Math.floor(random() * length)
const randomItem = <T>(items: readonly T[], source: string): T => requireSeed(items[randomIndex(items.length)], source)
const randomPage = (count: number, perPage: number, maxPages: number) => {
  const pages = Math.max(1, Math.min(Math.ceil(count / perPage), maxPages))
  return randomIndex(pages) + 1
}

const shuffled = <T>(items: readonly T[]) =>
  items
    .map((item, index) => ({ item, index, rank: random() }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ item }) => item)

const isAddress = (value: string): value is Address => /^0x[a-fA-F0-9]{40}$/.test(value)

/** Builds a recent unix-second range for endpoints that require explicit start/end params. */
export const nowRange = (days = 7) => {
  const end = Math.floor(Date.now() / 1000)
  return { end, start: end - days * 24 * 60 * 60 }
}

export const getSupportedChainSeed = once(async () => {
  const supportedChains = await chains.getSupportedChains(requestOptions)
  return requireSeed(
    supportedChains.find(chain => chain === preferredChain) ?? supportedChains[0],
    'chains.getSupportedChains',
  )
})

export const getPoolSeed = once(async (): Promise<PoolSeed> => {
  const supportedChains = await chains.getSupportedChains(requestOptions)

  for (const chain of shuffled(supportedChains)) {
    const response = await pools.getPools(chain, requestOptions)
    const pool = randomItem(response.pools, `pools.getPools(${chain})`)
    const mainToken = requireSeed(pool.coins[0]?.address, `pools.getPools(${chain}) main token`)
    const referenceToken = requireSeed(pool.coins[1]?.address, `pools.getPools(${chain}) reference token`)

    return { chain, mainToken, poolAddress: pool.address, referenceToken }
  }

  throw new Error('Missing live seed from pools.getPools pool')
})

const getGaugesSeed = once(async () => gauge.getGauges(requestOptions))

export const getGaugeSeed = once(async () => {
  const gauges = await getGaugesSeed()
  return randomItem(gauges, 'gauge.getGauges')
})

export const getGaugeVoteSeed = once(async () => {
  const gauges = await getGaugesSeed()

  for (const gaugeItem of shuffled(gauges).slice(0, 20)) {
    const votes = await gauge.getVotes(gaugeItem.address, requestOptions)
    const vote = votes.length > 0 ? randomItem(votes, `gauge.getVotes(${gaugeItem.address})`) : undefined

    if (vote) {
      return { gauge: gaugeItem, user: vote.user }
    }
  }

  throw new Error('Missing live seed from gauge.getVotes for 20 random gauges')
})

export const getDaoUserSeed = once(async () => {
  const lockers = await dao.getLockersTop(100, requestOptions)
  return randomItem(lockers.map(item => item.user).filter(isAddress), 'dao.getLockersTop(100) address user')
})

export const getProposalSeed = once(async () => {
  const perPage = 10
  const firstPage = await proposal.getProposals(1, perPage, '', 'all', 'all', requestOptions)
  const page = randomPage(firstPage.count, perPage, 50)
  const response = page === 1 ? firstPage : await proposal.getProposals(page, perPage, '', 'all', 'all', requestOptions)

  return randomItem(response.proposals, `proposal.getProposals(${page})`)
})

export const getProposalDetailsSeed = once(async () => {
  const seed = await getProposalSeed()
  return proposal.getProposal(seed.id, seed.type, seed.txCreation, requestOptions)
})

export const getProposalVoteSeed = once(async () => {
  const details = await getProposalDetailsSeed()
  const vote = randomItem(details.votes, 'proposal.getProposal votes')

  return { details, user: vote.voter }
})

export const getSavingsUserSeed = once(async () => {
  const perPage = 10
  const firstPage = await savings.getEvents(1, requestOptions)
  const page = randomPage(firstPage.count, perPage, 50)
  const response = page === 1 ? firstPage : await savings.getEvents(page, requestOptions)
  const users = response.events
    .flatMap(event => [event.owner, event.sender, event.receiver])
    .filter((value): value is Address => value !== undefined && isAddress(value))

  return randomItem(users, `savings.getEvents(${page}) address user`)
})

export const getCrvUsdMarketSeed = once(async (): Promise<MarketSeed> => {
  const allMarkets = await crvusd.getAllMarkets({ page: 1, per_page: 100 }, requestOptions)
  const markets = Object.entries(allMarkets).flatMap(([chain, items]) =>
    items.map(market => ({ chain: chain as Chain, market })),
  )
  const candidates = markets.filter(({ market }) => market.loans > 0)
  const { chain, market } = randomItem(candidates.length > 0 ? candidates : markets, 'crvusd.getAllMarkets')

  return { chain, controller: market.address, llamma: market.llamma }
})

export const getCrvUsdUserSeed = once(async (): Promise<MarketUserSeed> => {
  const seed = await getCrvUsdMarketSeed()
  const users = await llamalend.getMarketUsers('crvusd', seed.chain, seed.controller, requestOptions)
  const user = randomItem(
    users.users.map(user => user.user).filter(isAddress),
    `llamalend.getMarketUsers(crvusd, ${seed.chain})`,
  )

  return { ...seed, user }
})

export const getLlamalendChainSeed = once(async () => {
  const supportedChains = await llamalend.getChains(requestOptions)
  return randomItem(supportedChains, 'llamalend.getChains')
})

export const getLlamalendMarketSeed = once(async (): Promise<LlamalendMarketSeed> => {
  const allMarkets = await llamalend.getAllMarkets({ page: 1, per_page: 100 }, requestOptions)
  const markets = Object.entries(allMarkets).flatMap(([chain, items]) =>
    items.map(market => ({ chain: chain as Chain, market })),
  )
  const candidates = markets.filter(({ market }) => market.nLoans > 0)
  const { chain, market } = randomItem(candidates.length > 0 ? candidates : markets, 'llamalend.getAllMarkets')

  return { chain, controller: market.controller, llamma: market.llamma, vault: market.vault }
})

export const getLlamalendOracleSeed = once(async (): Promise<LlamalendMarketSeed> => {
  const allMarkets = await llamalend.getAllMarkets({ page: 1, per_page: 100 }, requestOptions)
  const markets = Object.entries(allMarkets).flatMap(([chain, items]) =>
    items.map(market => ({ chain: chain as Chain, market })),
  )
  const candidates = markets.filter(({ market }) => market.oraclePools.length > 0)
  const { chain, market } = randomItem(candidates, 'llamalend.getAllMarkets oracle-compatible market')

  return { chain, controller: market.controller, llamma: market.llamma, vault: market.vault }
})

export const getLlamalendUserSeed = once(async (): Promise<LlamalendUserSeed> => {
  const seed = await getLlamalendMarketSeed()
  const users = await llamalend.getMarketUsers('lending', seed.chain, seed.controller, requestOptions)
  const user = randomItem(
    users.users.map(user => user.user).filter(isAddress),
    `llamalend.getMarketUsers(lending, ${seed.chain})`,
  )

  return { ...seed, user }
})

export const getYieldBasisPoolSeed = once(async () => {
  const chain = await getSupportedChainSeed()
  const poolsResponse = await yieldBasis.getYieldBasisPools(chain, requestOptions)
  const pool = randomItem(poolsResponse, `yieldBasis.getYieldBasisPools(${chain})`)

  return { chain, poolAddress: pool.address }
})

export const getRefuelPoolSeed = once(async (): Promise<RefuelPoolSeed> => {
  const supportedChains = await refuel.getRefuelChains(requestOptions)
  const chain =
    supportedChains.find(chain => chain === preferredChain) ?? randomItem(supportedChains, 'refuel.getRefuelChains')
  const poolsResponse = await refuel.getRefuelPools(chain, requestOptions)
  const pool = randomItem(poolsResponse.pools, `refuel.getRefuelPools(${chain})`)

  return { chain, poolAddress: pool.address }
})
