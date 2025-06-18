import type { Metadata } from 'next'
import MarketList from '@/llamalend/lend/components/PageMarketList/Page'
import type { NetworkUrlParams } from '@/llamalend/lend/types/lend.types'

type MarketListPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Lend Markets - Curve LlamaLend' }

const MarketListPage = async ({ params }: MarketListPageProps) => <MarketList {...await params} />

export default MarketListPage
