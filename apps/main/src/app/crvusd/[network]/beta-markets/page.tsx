import type { Metadata } from 'next'
import { PageLlamaMarkets } from '@/loan/components/PageLlamaMarkets/Page'

export const metadata: Metadata = { title: 'Llamalend Markets - Curve' }

const LlamaMarketsPage = () => <PageLlamaMarkets /> // todo: SSR

export default LlamaMarketsPage
