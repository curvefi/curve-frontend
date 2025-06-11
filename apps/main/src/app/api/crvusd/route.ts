import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { refreshDataInBackground } from '@/background'
import { fetchAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { fetchLendingVaults } from '@/loan/entities/lending-vaults'
import { fetchMintMarkets } from '@/loan/entities/mint-markets'

const CrvUsdServerSideCache: CrvUsdServerData = {}

const getLlamaMarketsServerSideData = async () => {
  const [lendingVaults, mintMarkets, dailyVolume] = await Promise.all([
    fetchLendingVaults({}),
    fetchMintMarkets({}),
    fetchAppStatsDailyVolume({}),
  ])
  CrvUsdServerSideCache.lendingVaults = lendingVaults
  CrvUsdServerSideCache.mintMarkets = mintMarkets
  CrvUsdServerSideCache.dailyVolume = dailyVolume
}

refreshDataInBackground('CrvUsd', getLlamaMarketsServerSideData).catch(console.error)

export const dynamic = 'force-dynamic' // don't cache this route on the front-end, we are caching it on the server-side
export const revalidate = 60 // same as refreshDataInBackground, but cannot use variable here
export const GET = async () => Response.json(CrvUsdServerSideCache)
