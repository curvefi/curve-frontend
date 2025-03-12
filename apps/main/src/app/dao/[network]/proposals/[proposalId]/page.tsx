import type { Metadata } from 'next'
import PageProposal from '@/dao/components/PageProposal/Page'
import type { ProposalUrlParams } from '@/dao/types/dao.types'
import { t } from '@ui-kit/lib/i18n'

type ProposalPageProps = { params: Promise<ProposalUrlParams> }

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  const { proposalId } = await params
  return { title: [t`Proposal`, proposalId, 'Curve'].join(' - ') }
}

const ProposalPage = async ({ params }: ProposalPageProps) => <PageProposal {...await params} />

export default ProposalPage
