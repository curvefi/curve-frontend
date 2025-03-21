import memoizee from 'memoizee'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { LlamaMarketsPage, type LlamaMarketsPageProps } from '@/loan/components/PageLlamaMarkets/Page'
import { fetchSupportedChains, fetchSupportedLendingChains } from '@/loan/entities/chains'
import { fetchLendingVaults } from '@/loan/entities/lending-vaults'
import { fetchMintMarkets } from '@/loan/entities/mint-markets'
import { fetchAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'

export const metadata: Metadata = { title: 'Llamalend Markets - Curve' }

const getServerData = memoizee(
  async (): Promise<LlamaMarketsPageProps> => {
    const [lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume] = await Promise.all([
      fetchLendingVaults({}),
      fetchMintMarkets({}),
      fetchSupportedChains({}),
      fetchSupportedLendingChains({}),
      fetchAppStatsDailyVolume({}),
    ])
    return { lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume }
  },
  {
    promise: true,
    preFetch: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
)

const Page = async () => {
  const requestCookies = await cookies()
  const isCypress = requestCookies.get('cypress') ?? false // skip server data fetching in Cypress so we can mock it
  return <LlamaMarketsPage {...(!isCypress && (await getServerData()))} />
}

export default Page
