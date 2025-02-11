import type { PricesStatisticsDataResponse } from '@/loan/store/types'
import { Contract } from 'ethers'
import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { useWallet } from '@ui-kit/features/connect-wallet'

const VAULT_ADDRESS = '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367'
const YEAR = 86400 * 365.25 * 100
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
async function _fetchSavingsStatistics(): Promise<PricesStatisticsDataResponse> {
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
      last_updated: new Date(block?.timestamp ?? 0).toISOString(),
      last_updated_block: block?.number ?? 0,
      proj_apr: supplyNum > 0 ? (unlockAmountNum * 1e-12 * YEAR) / supplyNum : 0,
      supply: supplyNum / 1e18,
    }
  }

  const response = await fetch(`https://prices.curve.fi/v1/crvusd/savings/statistics`)
  return await response.json()
}

export const { useQuery: useScrvUsdStatistics } = queryFactory({
  queryKey: () => ['scrvUsdStatistics'] as const,
  queryFn: _fetchSavingsStatistics,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
