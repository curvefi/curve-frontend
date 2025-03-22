import {
  getLlamaMarketsServerSideData,
  LlamaMarketsServerSideData,
} from '@/app/crvusd/[network]/beta-markets/server-side-data'
import { getAllNetworks, getServerSideCache } from '@/app/dex/[network]/pools.util'
import type { NetworkConfig } from '@/dex/types/main.types'
import { DexServerSideCache } from '@/server-side-data'

const timeout = 1000 * 60 // 1 minute

// todo: we could optimize further by setting field by field
async function refreshDataInBackground(dexNetworks: { [p: number]: NetworkConfig }) {
  // noinspection InfiniteLoopJS
  while (true) {
    const start = Date.now()

    for (const network of Object.values(dexNetworks)) {
      DexServerSideCache[network.id] = await getServerSideCache(network).catch((e) => {
        console.error('Failed to fetch server-side cache for network', network.id, e)
        return {}
      })
    }

    LlamaMarketsServerSideData.result = await getLlamaMarketsServerSideData().catch((e) => {
      console.error('Failed to fetch server-side data for Llama Markets', e)
      return {}
    })

    const elapsed = Date.now() - start
    console.log(`Refreshed server-side data in ${elapsed}ms`)
    if (elapsed < timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout - elapsed))
    }
  }
}

export async function register() {
  const dexNetworks = await getAllNetworks()
  refreshDataInBackground(dexNetworks).catch(console.error)
}
