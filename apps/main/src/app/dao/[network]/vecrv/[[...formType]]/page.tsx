import type { Metadata } from 'next'
import PageVeCrv from '@/dao/components/PageVeCrv/Page'
import type { VeCrvUrlParams } from '@/dao/types/dao.types'

type VeCrvPageProps = { params: Promise<VeCrvUrlParams> }

export const metadata: Metadata = { title: 'CRV Locker - Curve' }

const VeCrvPage = async ({ params }: VeCrvPageProps) => <PageVeCrv {...await params} />

export default VeCrvPage
