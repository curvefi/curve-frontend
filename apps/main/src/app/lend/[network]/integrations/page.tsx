import Integrations from '@/lend/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { useParams } from 'react-router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Integrations {...params} />
}
