import memoizee from 'memoizee'
import type { Metadata } from 'next'
import { LlamaMarketsPage } from '@/loan/components/PageLlamaMarkets/Page'
import { fetchSupportedChains, fetchSupportedLendingChains } from '@/loan/entities/chains'
import { fetchLendingVaults } from '@/loan/entities/lending-vaults'
import { fetchMintMarkets } from '@/loan/entities/mint-markets'

export const metadata: Metadata = { title: 'Llamalend Markets - Curve' }

const getServerData = memoizee(
  async () => {
    const [lendingVaults, mintMarkets, supportedChains, supportedLendingChains] = await Promise.all([
      fetchLendingVaults({}),
      fetchMintMarkets({}),
      fetchSupportedChains({}),
      fetchSupportedLendingChains({}),
    ])
    return { lendingVaults, mintMarkets, supportedChains, supportedLendingChains }
  },
  {
    promise: true,
    preFetch: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
)

const Page = async () => <LlamaMarketsPage {...await getServerData()} />

export default Page
