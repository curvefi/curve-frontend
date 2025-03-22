import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { LlamaMarketsPage } from '@/loan/components/PageLlamaMarkets/Page'
import { LlamaMarketsServerSideData } from './server-side-data'

export const metadata: Metadata = { title: 'Llamalend Markets - Curve' }

const Page = async () => {
  const requestCookies = await cookies()
  const isCypress = requestCookies.get('cypress') ?? false // skip server data fetching in Cypress so we can mock it
  return <LlamaMarketsPage {...(!isCypress && LlamaMarketsServerSideData.result)} />
}

export default Page
