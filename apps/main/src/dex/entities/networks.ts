import { useMemo } from 'react'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { defaultNetworks, getNetworks as getNetworksLib } from '../lib/networks'

const { useQuery, fetchQuery, getQueryData } = queryFactory({
  queryKey: () => ['networks'] as const,
  queryFn: getNetworksLib,
  validationSuite: EmptyValidationSuite, // no args
  category: 'dex.network',
})

export const useNetworksQuery = () => useQuery({})
export const fetchNetworks = () => fetchQuery({})
export const getNetworks = () => {
  const result = getQueryData({})
  if (!result) {
    throw new Error('Do not use this hook while loading, it should be after RootLayout has loaded the networks')
  }
  return result
}

/** Only use this after the networks have been fetched in the RootLayout. Used for legacy code only. */
export const useNetworks = () => {
  const { data, isPending } = useNetworksQuery()
  if (isPending) {
    throw new Error('Do not use this hook while loading, it should be after RootLayout has loaded the networks')
  }
  return { data: data ?? defaultNetworks }
}

export const useNetworkByChain = ({ chainId }: { chainId: number }) => {
  const { data: networks } = useNetworks()
  const network = useMemo(() => networks[chainId], [chainId, networks])
  if (!network) throw new Error(`Network not found with chainId ${chainId}`)
  return { data: network }
}
