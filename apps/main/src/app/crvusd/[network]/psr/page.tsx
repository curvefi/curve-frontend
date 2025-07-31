import type { Metadata } from 'next'
import { Page } from '@/loan/components/PagePegKeepers'
import type { NetworkUrlParams } from '@/loan/types/loan.types'

type PegKeepersPageProps = { params: Promise<NetworkUrlParams> }

export const metadata: Metadata = { title: 'Peg Stability Reserves - Curve' }

const PegKeepersPage = async ({ params }: PegKeepersPageProps) => <Page {...await params} />

export default PegKeepersPage
