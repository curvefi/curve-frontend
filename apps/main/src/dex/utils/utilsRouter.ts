import { MAIN_ROUTE, ROUTE } from '@/dex/constants'
import useStore from '@/dex/store/useStore'
import { useMemo } from 'react'
import { FormTypes, NetworkEnum, RouterParams, type UrlParams } from '@/dex/types/main.types'

export const getPath = ({ network }: UrlParams, rerouteRoute: string) =>
  `/dex/${network ? `/${network}` : ''}${rerouteRoute}`

export function useParsedParams(params: UrlParams, chainIdNotRequired?: boolean) {
  const { pool, formType } = params
  const paths = window.location.hash.substring(2).split('/')

  const network = useNetworkFromUrl()

  // subdirectory
  let rSubdirectory = ROUTE.PAGE_SWAP.substring(1)
  let rSubdirectoryUseDefault = true
  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = paths[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(MAIN_ROUTE).find(
      (k) => MAIN_ROUTE[k as keyof typeof MAIN_ROUTE].substring(1).toLowerCase() === subdirectory.toLowerCase(),
    )
    if (foundSubdirectory) {
      rSubdirectory = subdirectory
      rSubdirectoryUseDefault = false
    }
  }

  let rPoolId = ''
  if (pool) {
    rPoolId = pool
  }

  let rFormType: RouterParams['rFormType'] = ''

  if (formType?.[0]) {
    const type = formType[0].toLowerCase()
    rFormType = FormTypes.find((t) => t == type) ?? ''
  }

  const parsedPathname = `${network.rNetwork}/${rSubdirectory}`
  const redirectPathname =
    window.location.hash.substring(1).startsWith(parsedPathname) ||
    (chainIdNotRequired && window.location.hash.substring(1).startsWith(`${rSubdirectory}`))
      ? ''
      : parsedPathname

  return {
    ...network,
    rSubdirectory,
    rSubdirectoryUseDefault,
    rPoolId,
    rFormType,
    redirectPathname,
    restFullPathname: useRestFullPathname(),
  } as RouterParams
}

export function useNetworkFromUrl() {
  const networks = useStore((state) => state.networks.networks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const hash = window.location.hash
  return useMemo(() => {
    const restPathnames = hash?.substring(2)?.split('/') ?? []
    const firstPath = (restPathnames[0] ?? '').toLowerCase() as NetworkEnum
    const secondPath = (restPathnames[1] ?? '').toLowerCase() as NetworkEnum

    if (networksIdMapper[firstPath]) {
      const rChainId = networksIdMapper[firstPath]
      return {
        rNetworkIdx: 0,
        rNetwork: networks[rChainId].id,
        rChainId,
      }
    } else if (networksIdMapper[secondPath]) {
      const rChainId = networksIdMapper[secondPath]
      return {
        rNetworkIdx: 1,
        rNetwork: networks[rChainId].id,
        rChainId,
      }
    } else {
      return {
        rNetworkIdx: -1,
        rNetwork: networks[1].id,
        rChainId: 1 as const,
      }
    }
  }, [networks, networksIdMapper, hash])
}

export function useRestFullPathname() {
  const restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  const { rNetworkIdx } = useNetworkFromUrl()
  return restPathnames.slice(rNetworkIdx + 1, restPathnames.length).join('/')
}

export function useRestPartialPathname() {
  let restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  const lastIdx = restPathnames.length - 1
  if (restPathnames[lastIdx] && restPathnames[lastIdx].includes('?')) {
    restPathnames[lastIdx] = restPathnames[lastIdx].split('?')[0]
  }
  const { rNetworkIdx } = useNetworkFromUrl()
  let endIdx = restPathnames.length
  let found = false
  ;['pools', 'swap'].forEach((p) => {
    if (!found && restPathnames.indexOf(p) !== -1) {
      found = true
      endIdx = restPathnames.indexOf(p) + 1
    }
  })
  return restPathnames.slice(rNetworkIdx + 1, endIdx).join('/')
}
