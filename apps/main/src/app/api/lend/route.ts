import { refreshDataInBackground, RefreshTimeoutMs } from '@/background'
import { fetchJson } from '@curvefi/prices-api/fetch'
import type { LendServerData, LendingVaultFromApi } from './types'

const LendServerSideCache: LendServerData = {}

type Response = {
  data: { lendingVaultData: LendingVaultFromApi[] }
}

refreshDataInBackground('Lend', async () => {
  const { data } = await fetchJson<Response>(`https://api.curve.fi/api/getLendingVaults/all`)
  LendServerSideCache.lendingVaultData = data.lendingVaultData
}).catch(console.error)

export const dynamic = 'force-dynamic' // don't cache this route on the front-end, we are caching it on the server-side
export const revalidate = RefreshTimeoutMs / 1000

export const GET = () => Response.json(LendServerSideCache)
