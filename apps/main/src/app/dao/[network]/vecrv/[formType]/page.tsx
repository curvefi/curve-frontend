import type { Metadata } from 'next'
import type { VeCrvUrlParams } from '@/dao/types/dao.types'
import PageVeCrv from '@/dao/components/PageVeCrv/Page'

type VeCrvPageProps = { params: Promise<VeCrvUrlParams> }

export const metadata: Metadata = { title: 'Curve - CRV Locker' }

const VeCrvPage = async ({ params }: VeCrvPageProps) => <PageVeCrv {...await params} />

export default VeCrvPage
