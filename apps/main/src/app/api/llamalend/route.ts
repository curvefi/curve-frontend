import type { LlamalendServerData } from '@/app/api/llamalend/types'
import { refreshDataInBackground } from '@/background'
import { fetchLendingVaults } from '@/llamalend/entities/lending-vaults'
import { fetchMintMarkets } from '@/llamalend/entities/mint-markets'

const LlamalendServerSideCache: LlamalendServerData = {}

const getLlamaMarketsServerSideData = async () => {
  const [lendingVaults, mintMarkets] = await Promise.all([fetchLendingVaults({}), fetchMintMarkets({})])
  LlamalendServerSideCache.lendingVaults = lendingVaults
  LlamalendServerSideCache.mintMarkets = mintMarkets
}

refreshDataInBackground('llamalend', getLlamaMarketsServerSideData).catch(console.error)

export const dynamic = 'force-dynamic' // don't cache this route on the front-end, we are caching it on the server-side
export const revalidate = 60 // same as refreshDataInBackground, but cannot use variable here
export const GET = async () => Response.json(LlamalendServerSideCache)
