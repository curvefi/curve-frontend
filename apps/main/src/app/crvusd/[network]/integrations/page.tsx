import Integrations from '@/loan/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  return <Integrations {...useParams<NetworkUrlParams>()} />
}
