import Integrations from '@/dex/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Integrations {...params} />
}
