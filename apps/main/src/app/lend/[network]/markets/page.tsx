import type { Metadata } from 'next'
import MarketList from '@/lend/components/PageMarketList/Page'
import type { NetworkUrlParams } from '@/lend/types/lend.types'

type MarketListPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Markets - Curve Lend' }

const MarketListPage = async ({ params }: MarketListPageProps) => <MarketList {...await params} />

export default MarketListPage
