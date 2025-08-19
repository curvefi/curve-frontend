import { PageProposal } from '@/dao/components/PageProposal/Page'
import type { ProposalUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams() as ProposalUrlParams
  return <PageProposal {...params} />
}
