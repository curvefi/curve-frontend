import networks, { networksIdMapper } from '@/lend/networks'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { Integrations } from '@ui-kit/features/integrations'
import { useParams } from '@ui-kit/hooks/router'

export const PageIntegrations = () => {
  const params = useParams<NetworkUrlParams>()
  const rChainId = networksIdMapper[params.network]

  return <Integrations chainId={rChainId} networks={Object.values(networks)} />
}
