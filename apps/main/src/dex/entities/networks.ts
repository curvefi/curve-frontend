import { useMemo } from 'react'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { defaultNetworks, getNetworks as getNetworksLib } from '../lib/networks'

const {
  useQuery: useNetworksQuery,
  fetchQuery: fetchNetworksQuery,
  getQueryData: getNetworksQuery,
} = queryFactory({
  queryKey: () => ['networks'] as const,
  queryFn: getNetworksLib,
  staleTime: '1h',
  refetchInterval: '1h',
  validationSuite: curveApiValidationSuite,
})

export const fetchNetworks = () => fetchNetworksQuery({})
export const getNetworks = () => getNetworksQuery({})

/** Helper method to initialize data as empty object by default, a lot of legacy code depends on that behavior */
export const useNetworks = () => {
  const { data: networks, isError } = useNetworksQuery({})
  return { data: isError ? defaultNetworks : networks, isError }
}

export const useNetworkByChain = ({ chainId }: { chainId: number }) => {
  const { data: networks } = useNetworks()
  if (!networks) throw new Error('Networks not loaded')
  const network = useMemo(() => networks[chainId], [chainId, networks])
  if (!network) throw new Error(`Network not found for chainId ${chainId}`)
  return { data: network }
}
