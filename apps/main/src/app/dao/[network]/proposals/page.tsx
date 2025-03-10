import type { Metadata } from 'next'
import PageDao from '@/dao/components/PageProposals/Page'

export const metadata: Metadata = { title: 'Proposals - Curve' }

const ProposalsPage = () => <PageDao />

export default ProposalsPage
