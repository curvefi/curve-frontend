import { groupBy, capitalize } from 'lodash'
import type { Address } from 'viem'
import { addQueryString, FetchError } from '@curvefi/prices-api/fetch'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import type { CampaignPoolRewards } from './types'

type MerkleReward = {
  token: {
    /** Chain id of the token. Is a number, like '1' being Ethereum mainnet */
    chainId: number
    /** Token address that is *NOT* lowercased */
    address: Address
    /** There's also a 'symbol', not sure how they differ, but I'm guessing this is the right one */
    displaySymbol: string
    /** Full URL to the icon. We should use this one because curve-assets repo might be missing some; these are guaranteed to be available */
    icon: string
  }
}

/** The API response returned by the Merkl Opportunity endpoint. We only extract what we need; much more other data is returned */
type MerklOpportunity = {
  /** Used to generate dashboardLink */
  type: string
  /** Used to generate dashboardLink */
  identifier: string
  /** Opportunity name, useful for in titles */
  name: string
  /** Description is a one-liner explanation of the opportunity */
  description: string
  /** More detailed steps on how to actually earn those rewards */
  howToSteps: string[]
  /** APR for all campaigns together. Individual APR per reward token is not available from just the opportunity data */
  apr: number
  /** The contract address (*NOT* lowercased!) associated with the opportunity. For Curve DEX campaigns this is the pool address. */
  explorerAddress: Address
  /** Tags are usually protocols involved in the entire reward chain, so can be considerd the "platform" */
  tags: string[]
  rewardsRecord: {
    breakdowns: MerkleReward[]
  }
}

const opportunityToCampaignPoolRewards = (opp: MerklOpportunity): CampaignPoolRewards[] =>
  opp.rewardsRecord.breakdowns.map(({ token }) => ({
    campaignName: opp.name,
    platform: opp.tags.map((tag) => capitalize(tag)).join(', '),
    platformImageId: token.icon,
    dashboardLink: `https://app.merkl.xyz/opportunities/ethereum/${opp.type}/${opp.identifier}`,

    address: opp.explorerAddress.toLocaleLowerCase() as Address,
    description: opp.description,
    steps: opp.howToSteps,
    lock: false, // i dont think merkle offers 'locked' rewards?
    multiplier: token.displaySymbol, // Merkl campaigns don't have a multiplier, just a token. And APR is for the whole opportunity

    tags: [], // what are we using this for???
    action: 'lp', // for now we focus on LP pool campaigns only
    network: 'ethereum', // fuck, we need to refactor networks first
  }))

/**
 * Merkl opportunities are a collection of campaigns that target the same thing, like a dex pool.
 * Although there's an NPM package available with Typescript support for their API, our limited use cases
 * does not warrant adding yet another dependency, despite it being small and having no deps itself.
 * We may reconsider this when we have more advanced use cases of using their API. For now `fetch` suffices.
 *
 * API is also available in the browser for testing and experimenting at https://api.merkl.xyz/docs
 */
export const {
  useQuery: useCampaignsMerkl,
  getQueryOptions: getCampaignsMerklOptions,
  getQueryData: getCampaignsMerkl,
} = queryFactory({
  queryKey: () => ['campaigns-merkl'] as const,
  queryFn: async () => {
    const params = {
      mainProtocolId: 'curve',
      test: false,
      status: 'LIVE',
      action: 'POOL', // Only pool campaigns for now. Perhaps there will be lending campaigns in the future
    }

    const url = `https://api.merkl.xyz/v4/opportunities${addQueryString(params)}`
    const resp = await fetch(url, { method: 'GET' })

    if (!resp.ok) {
      throw new FetchError(resp.status, `Merkl fetch error ${resp.status} for URL: ${url}`)
    }

    const opportunities = (await resp.json()) as MerklOpportunity[]
    const campaigns = opportunities.flatMap(opportunityToCampaignPoolRewards)

    // Can't use Object.groupBy until we support ES2024
    return groupBy(campaigns, (x) => x.address)
  },
  validationSuite: EmptyValidationSuite,
  refetchInterval: '10m',
})
