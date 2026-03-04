import { Contract } from 'ethers'
import { SCRVUSD_VAULT_ADDRESS } from '@/loan/constants'
import { getStatistics } from '@curvefi/prices-api/savings'
import type { Statistics } from '@curvefi/prices-api/savings/models'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { weiToEther } from '@ui-kit/utils'

const YEAR = 86400 * 365.25 * 100
const UNLOCK_MULTIPLIER = 1e-12 * YEAR
const VAULT_ABI = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'profitUnlockingRate',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

/**
 * Fetches the savings yield data from the Curve API.
 * If a provider is provided, the data is fetched from the vault contract directly.
 * That provides more accurate data and works even if our servers are down.
 */
async function _fetchSavingsStatistics(): Promise<Statistics> {
  const { provider } = useWallet.getState()

  if (provider) {
    const vault = new Contract(SCRVUSD_VAULT_ADDRESS, VAULT_ABI, provider)
    const [profitUnlockingRate, supply, block] = await Promise.all([
      vault.profitUnlockingRate(),
      vault.totalSupply(),
      provider.getBlock('latest'),
    ])

    const profitUnlockingRateNum = Number(profitUnlockingRate)
    const supplyNum = Number(supply)
    const apr = supplyNum > 0 ? (profitUnlockingRateNum * UNLOCK_MULTIPLIER) / supplyNum : 0
    const apy = (1 + apr / 100 / 365.25) ** 365.25 - 1

    return {
      lastUpdated: new Date(block?.timestamp ?? 0),
      lastUpdatedBlock: block?.number ?? 0,
      apyProjected: apy * 100,
      supply: weiToEther(supplyNum),
    }
  }

  return getStatistics()
}

export const { useQuery: useScrvUsdStatistics } = queryFactory({
  queryKey: () => ['scrvUsdStatistics'] as const,
  queryFn: _fetchSavingsStatistics,
  validationSuite: EmptyValidationSuite,
  category: 'savings.stats',
})
