import type { FilterKey } from '@/dex/components/PageIntegrations/types'
import type { IntegrationsTags } from '@ui/Integration/types'
import type { ChainOption } from '@ui-kit/features/switch-chain'
import { ChainId } from '@/dex/types/main.types'

export function parseSearchParams(
  searchParams: URLSearchParams | undefined,
  rChainId: ChainId | '',
  visibleNetworksList: Iterable<ChainOption<ChainId>>,
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
      Array.from(visibleNetworksList)
        .find(({ chainId }) => Number(pNetworkId) === chainId)
        ?.chainId?.toString() ?? ''
  }

  return parsed
}
