import type { Metadata } from 'next'
import { PagePoolList } from '@/dex/components/PagePoolList/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'

type PoolListPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Pools - Curve' }

const PoolListPage = async ({ params }: PoolListPageProps) => <PagePoolList {...await params} />

export default PoolListPage
