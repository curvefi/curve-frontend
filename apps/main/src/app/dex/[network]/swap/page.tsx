import type { Metadata } from 'next'
import { PageRouterSwap } from '@/dex/components/PageRouterSwap/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

type SwapPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Swap - Curve' }

const SwapPage = async ({ params }: SwapPageProps) => <PageRouterSwap {...await params} />

export default SwapPage
