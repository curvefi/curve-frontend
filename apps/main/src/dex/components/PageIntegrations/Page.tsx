import { useNetworks } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { Integrations } from '@ui-kit/features/integrations'
import { useParams } from '@ui-kit/hooks/router'

export const PageIntegrations = () => {
  const { network } = useParams<NetworkUrlParams>()
  const rChainId = useChainId(network)
  const { data: networks } = useNetworks()

  return <Integrations chainId={rChainId} networks={Object.values(networks)} />
}
