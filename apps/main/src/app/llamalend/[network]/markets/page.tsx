import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { getServerData } from '@/background'
import { LlamaMarketsPage } from '@/loan/components/PageLlamaMarkets/Page'

export const metadata: Metadata = { title: 'Llamalend Beta Markets - Curve' }

const Page = async () => {
  const [requestCookies, requestHeaders] = await Promise.all([cookies(), headers()])
  const isCypress = requestCookies.get('cypress') ?? false
  return <LlamaMarketsPage {...(!isCypress && (await getServerData<CrvUsdServerData>('crvusd', requestHeaders)))} />
}

export default Page
