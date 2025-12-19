import type { FilterKey } from '@/dex/types/integrations.types'
import { ChainId, NetworkConfig } from '@/dex/types/main.types'
import type { IntegrationsTags } from '@ui-kit/features/integrations'

export function parseSearchParams(
  searchParams: URLSearchParams | null,
  rChainId: ChainId | '',
  visibleNetworksList: NetworkConfig[],
  integrationsTags: IntegrationsTags | null,
) {
  const pFilterKey = searchParams?.get('filter')
  const pNetworkId = searchParams?.get('networkId')

  const parsed: { filterKey: FilterKey; filterNetworkId: string } = {
    filterKey: 'all',
    filterNetworkId: (pNetworkId ?? rChainId ?? '').toString(),
  }

  if (pFilterKey) {
    parsed.filterKey = (integrationsTags?.[pFilterKey]?.id ?? 'all') as FilterKey
  }

  if (pNetworkId) {
    parsed.filterNetworkId =
      visibleNetworksList
        .find(({ chainId, showInSelectNetwork }) => showInSelectNetwork && Number(pNetworkId) === chainId)
        ?.chainId?.toString() ?? ''
  }

  return parsed
}
