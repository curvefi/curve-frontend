import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import type { LlamalendServerData } from '@/app/api/llamalend/types'
import { getServerData } from '@/background'
import { LlamaMarketsPage } from '@/llamalend/PageLlamaMarkets/Page'

export const metadata: Metadata = { title: 'Llamalend Beta Markets - Curve' }

const Page = async () => {
  const [requestCookies, requestHeaders] = await Promise.all([cookies(), headers()])
  const isCypress = requestCookies.get('cypress') ?? false
  return (
    <LlamaMarketsPage {...(!isCypress && (await getServerData<LlamalendServerData>('llamalend', requestHeaders)))} />
  )
}

export default Page
