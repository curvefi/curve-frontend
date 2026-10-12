import type { Address } from '@primitives/address.utils'
import { fetchJson } from '@primitives/fetch.utils'

const BALANCER_API_URL = 'https://api-v3.balancer.fi/'
/** Dust positions aren't worth the migration gas. */
const MIN_POSITION_USD = 1

/** Balancer API `GqlChain` values for the chains both Balancer and Curve support. */
const BALANCER_CHAINS: Record<number, string> = {
  1: 'MAINNET',
  10: 'OPTIMISM',
  100: 'GNOSIS',
  137: 'POLYGON',
  146: 'SONIC',
  252: 'FRAXTAL',
  999: 'HYPEREVM',
  8453: 'BASE',
  42161: 'ARBITRUM',
  43114: 'AVALANCHE',
}

export const getBalancerChain = (chainId: number) => BALANCER_CHAINS[chainId]

/** Balances are decimal strings in token units; BPT always has 18 decimals. */
type BalancerPoolResponse = {
  id: string
  address: Address
  name: string
  symbol: string
  type: string
  protocolVersion: number
  /** `apr` is a fraction (0.05 = 5%). */
  dynamicData: { totalLiquidity: string; totalShares: string; aprItems: { title: string; type: string; apr: number }[] }
  poolTokens: {
    address: Address
    symbol: string
    decimals: number
    underlyingToken: { address: Address; symbol: string } | null
  }[]
  userBalance: {
    walletBalance: string
    walletBalanceUsd: number
    totalBalance: string
    totalBalanceUsd: number
    stakedBalances: { balance: string; balanceUsd: number; stakingType: string }[]
  } | null
}

export type BalancerPosition = Omit<BalancerPoolResponse, 'userBalance'> & {
  userBalance: NonNullable<BalancerPoolResponse['userBalance']>
}

const USER_POOLS_QUERY = `
query UserPools($chain: GqlChain!, $userAddress: String!) {
  poolGetPools(where: { chainIn: [$chain], userAddress: $userAddress }, first: 100) {
    id address name symbol type protocolVersion
    dynamicData { totalLiquidity totalShares aprItems { title type apr } }
    poolTokens { address symbol decimals underlyingToken { address symbol } }
    userBalance {
      walletBalance walletBalanceUsd totalBalance totalBalanceUsd
      stakedBalances { balance balanceUsd stakingType }
    }
  }
}`

export async function fetchBalancerPositions(chainId: number, userAddress: Address): Promise<BalancerPosition[]> {
  const chain = getBalancerChain(chainId)
  if (!chain) return []
  const { data, errors } = await fetchJson<{
    data?: { poolGetPools: BalancerPoolResponse[] }
    errors?: { message: string }[]
  }>(BALANCER_API_URL, { body: { query: USER_POOLS_QUERY, variables: { chain, userAddress } } })
  if (errors?.length) throw new Error(`Balancer API: ${errors.map(e => e.message).join(', ')}`)
  return (data?.poolGetPools ?? []).filter(
    (pool): pool is BalancerPosition => !!pool.userBalance && pool.userBalance.totalBalanceUsd >= MIN_POSITION_USD,
  )
}
