import { refreshDataInBackground } from '@/background'
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
export const revalidate = 60 // same as refreshDataInBackground, but cannot use variable here

export const GET = () => Response.json(LendServerSideCache)
