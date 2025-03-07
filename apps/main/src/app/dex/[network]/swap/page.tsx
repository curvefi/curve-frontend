import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import Swap from '@/dex/components/PageRouterSwap/Page'

type SwapPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Swap - Curve' }

const SwapPage = async ({ params }: SwapPageProps) => <Swap {...await params} />

export default SwapPage
