import type { Metadata } from 'next'
import PegKeepers from '@/loan/components/PagePegKeepers/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'

type PegKeepersPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'PegKeepers - Curve' }

const PegKeepersPage = async ({ params }: PegKeepersPageProps) => <PegKeepers {...await params} />

export default PegKeepersPage
