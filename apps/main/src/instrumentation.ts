import { getLlamaMarketsServerSideData, LlamaMarketsServerSideCache } from '@/app/crvusd/server-side-data'
import { getAllNetworks, getServerSideCache } from '@/app/dex/[network]/pools.util'
import { getAllLendingVaults, lendServerSideCache } from '@/app/lend/server-side.data'
import { DexServerSideCache } from '@/server-side-data'

const timeout = 1000 * 60 // 1 minute

async function refreshDex() {
  const dexNetworks = await getAllNetworks()
  for (const network of Object.values(dexNetworks)) {
    const networkStart = Date.now()
    DexServerSideCache[network.id] = await getServerSideCache(network)
    console.log(`Refreshed DEX ${network.id} in ${Date.now() - networkStart}ms`)
  }
}

const refreshLend = async () => (lendServerSideCache.lendingVaultData = await getAllLendingVaults())

const refreshCrvUsd = async () => (LlamaMarketsServerSideCache.result = await getLlamaMarketsServerSideData())

async function refreshDataInBackground(name: string, callback: () => Promise<unknown>) {
  // noinspection InfiniteLoopJS
  while (true) {
    const start = Date.now()
    await callback().catch((e) => {
      console.error(`Failed to refresh ${name}`, e)
    })
    const elapsed = Date.now() - start
    console.log(`Refreshed ${name} in ${elapsed}ms`)
    if (elapsed < timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout - elapsed))
    }
  }
}

export async function register() {
  refreshDataInBackground('Dex', refreshDex).catch(console.error)
  refreshDataInBackground('Lend', refreshLend).catch(console.error)
  refreshDataInBackground('CrvUsd', refreshCrvUsd).catch(console.error)
}
