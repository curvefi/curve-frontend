import type { Metadata } from 'next'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import MarketList from '@/lend/components/PageMarketList/Page'

type MarketListPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Curve - MarketList' }

const MarketListPage = async ({ params }: MarketListPageProps) => <MarketList {...await params} />

export default MarketListPage
