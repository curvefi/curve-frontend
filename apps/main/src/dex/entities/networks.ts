import { useMemo } from 'react'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { defaultNetworks, getNetworks as getNetworksLib } from '../lib/networks'
import type { NetworkConfig } from '../types/main.types'

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
export const getNetworks = () => getNetworksQuery({}) ?? defaultNetworks

/** Helper method to initialize data as empty object by default, a lot of legacy code depends on that behavior */
export const useNetworks = () => {
  const { data: networks = defaultNetworks, ...rest } = useNetworksQuery({})
  return { data: networks, ...rest }
}

export const useNetworkByChain = ({ chainId }: { chainId: number }) => {
  const { data: networks, ...rest } = useNetworks()
  const network = useMemo(() => (chainId ? networks[chainId] : ({} as NetworkConfig)), [chainId, networks])

  return { data: network, ...rest }
}
