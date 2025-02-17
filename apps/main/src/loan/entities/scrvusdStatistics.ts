import type { Statistics } from '@curvefi/prices-api/savings/models'
import { Contract } from 'ethers'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { weiToEther } from '@ui-kit/utils'
import { getStatistics } from '@curvefi/prices-api/savings'

const VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367'
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
    const vault = new Contract(VAULT_ADDRESS, VAULT_ABI, provider)
    const [unlock_amount, supply, block] = await Promise.all([
      vault.profitUnlockingRate(),
      vault.totalSupply(),
      provider.getBlock('latest'),
    ])

    const unlockAmountNum = Number(unlock_amount)
    const supplyNum = Number(supply)

    return {
      lastUpdated: new Date(block?.timestamp ?? 0),
      lastUpdatedBlock: block?.number ?? 0,
      aprProjected: supplyNum > 0 ? (unlockAmountNum * UNLOCK_MULTIPLIER) / supplyNum : 0,
      supply: weiToEther(supplyNum),
    }
  }

  const data = await getStatistics()

  return data
}

export const { useQuery: useScrvUsdStatistics } = queryFactory({
  queryKey: () => ['scrvUsdStatistics'] as const,
  queryFn: _fetchSavingsStatistics,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
