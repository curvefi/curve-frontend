// todo: we import the lend integrations page for now, we should refactor the integrations page to be shared between all apps
// eslint-disable-next-line import/no-restricted-paths
import Integrations from '@/lend/components/PageIntegrations/Page'
import type { NetworkUrlParams } from '@/llamalend/llamalend.types'
import { useParams } from '@ui-kit/hooks/router'

export default function Component() {
  const params = useParams<NetworkUrlParams>()
  return <Integrations {...params} />
}
