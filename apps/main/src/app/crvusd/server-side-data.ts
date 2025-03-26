import type { LlamaMarketsPageProps } from '@/loan/components/PageLlamaMarkets/Page'
import { fetchAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { fetchSupportedChains, fetchSupportedLendingChains } from '@/loan/entities/chains'
import { fetchLendingVaults } from '@/loan/entities/lending-vaults'
import { fetchMintMarkets } from '@/loan/entities/mint-markets'

export const LlamaMarketsServerSideCache: { result: LlamaMarketsPageProps } = { result: {} }

export const getLlamaMarketsServerSideData = async (): Promise<LlamaMarketsPageProps> => {
  const [lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume] = await Promise.all([
    fetchLendingVaults({}),
    fetchMintMarkets({}),
    fetchSupportedChains({}),
    fetchSupportedLendingChains({}),
    fetchAppStatsDailyVolume({}),
  ])
  return { lendingVaults, mintMarkets, supportedChains, supportedLendingChains, dailyVolume }
}
