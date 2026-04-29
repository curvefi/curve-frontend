import { capitalize, groupBy } from 'lodash'
import type { Address } from 'viem'
import { paginate } from '@curvefi/prices-api/paginate'
import { addQueryString, FetchError } from '@primitives/fetch.utils'
import { formatPercent } from '@ui-kit/utils'
import type { RewardsAction } from '@external-rewards'
import type { CampaignRewards } from './types'

type MerklAction = 'POOL' | 'BORROW' | 'LEND'

type MerklReward = {
  token: {
    /** Chain id of the token. Is a number, like '1' being Ethereum mainnet */
    chainId: number
    /** Token address that is *NOT* lowercased */
    address: Address
    /** There's also a 'displaySymbol', but sometimes that one's empty, but I'm guessing this is the right one */
    symbol: string
    /** Full URL to the icon. We should use this one because curve-assets repo might be missing some; these are guaranteed to be available */
    icon: string
  }
  /** Probably the USD value. Either way, only used to filter 'empty' campaigns, which are a thing apparantly. */
  value: 0
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
  /** The type of action that is rewarded, like providing liquidity in a pool, or borrowing or lending */
  action: MerklAction
  /** APR for all campaigns together. Individual APR per reward token is not available from just the opportunity data */
  apr: number
  /** The contract address (*NOT* lowercased!) associated with the opportunity. For Curve DEX campaigns this is the pool address. */
  explorerAddress: Address
  /** Tags are usually protocols involved in the entire reward chain, so can be considerd the "platform" */
  tags: string[]
  chain: {
    id: number
    name: string
  }
  rewardsRecord: {
    breakdowns: MerklReward[]
  }
}

const ACTIONS: Record<MerklAction, RewardsAction> = {
  POOL: 'lp',
  BORROW: 'borrow',
  LEND: 'supply',
}

const opportunityToCampaignRewards = (opp: MerklOpportunity): CampaignRewards[] => {
  const network = opp.chain.name.toLocaleLowerCase()

  return (
    opp.rewardsRecord.breakdowns
      // Filter rewards with a value of 0. Maybe campaign devs are testing something, as such campaigns exist in real life data.
      .filter(({ value }) => value > 0)
      // Convert actual token reward data into the more generic data type we use all across the app.
      .map(({ token }) => ({
        campaignName: opp.name,
        platform: opp.tags.map((tag) => capitalize(tag)).join(', '),
        platformImageId: token.icon,
        dashboardLink: `https://app.merkl.xyz/opportunities/${network}/${opp.type}/${opp.identifier}`,

        address: opp.explorerAddress.toLocaleLowerCase() as Address,
        description: opp.description,
        steps: opp.howToSteps,
        lock: false, // Merkl doesn't offer 'locked' rewards.

        // Merkl campaigns don't have a multiplier, just a token. And APR is only available for the whole opportunity.
        multiplier: opp.apr ? formatPercent(opp.apr) : token.symbol,

        tags: ['tokens'], // Merkl rewards are tokens only as far as I know; no points.
        action: ACTIONS[opp.action],
        network,
      }))
  )
}

/**
 * Merkl opportunities are a collection of campaigns that target the same thing, like a dex pool.
 * Although there's an NPM package available with Typescript support for their API, our limited use cases
 * does not warrant adding yet another dependency, despite it being small and having no deps itself.
 * We may reconsider this when we have more advanced use cases of using their API. For now `fetch` suffices.
 *
 * API is also available in the browser for testing and experimenting at https://api.merkl.xyz/docs
 */
export const fetchMerklRewards = async (params: object) => {
  const fetchPage = async (page: number, items: number) => {
    const url = `https://api.merkl.xyz/v4/opportunities${addQueryString({
      ...params,
      items,
      page,
    })}`
    const resp = await fetch(url, { method: 'GET' })

    if (!resp.ok) {
      throw new FetchError(resp.status, `Merkl fetch error ${resp.status} for URL: ${url}`)
    }

    return (await resp.json()) as MerklOpportunity[]
  }

  const opportunities = await paginate(fetchPage, 0, 100)
  const campaigns = opportunities.flatMap(opportunityToCampaignRewards)

  // Can't use Object.groupBy until we support ES2024
  return groupBy(campaigns, (x) => x.address)
}
