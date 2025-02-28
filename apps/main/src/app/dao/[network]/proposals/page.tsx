import type { Metadata } from 'next'
import PageDao from '@/dao/components/PageProposals/Page'

export const metadata: Metadata = { title: 'Curve - Proposals' }

const ProposalsPage = () => <PageDao />

export default ProposalsPage
