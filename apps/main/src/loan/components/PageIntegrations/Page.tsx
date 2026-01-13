import { networks } from '@/loan/networks'
import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { useChainId } from '@/loan/utils/utilsRouter'
import { Integrations } from '@ui-kit/features/integrations'
import { useParams } from '@ui-kit/hooks/router'

export const PageIntegrations = () => {
  const params = useParams<NetworkUrlParams>()
  const rChainId = useChainId(params)

  return <Integrations chainId={rChainId} networks={Object.values(networks)} />
}
