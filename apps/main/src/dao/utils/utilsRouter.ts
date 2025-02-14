import type { Params } from 'react-router'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { ROUTE } from '@/dao/constants'
import networks, { networksIdMapper } from '@/dao/networks'
import { NetworkEnum, RouterParams } from '@/dao/types/dao.types'

export const getPath = ({ network }: Params, rerouteRoute: string) => `${network ? `/${network}` : ''}${rerouteRoute}`

export function parseParams(params: Params, chainIdNotRequired?: boolean) {
  const { proposalId, userAddress, gaugeAddress, formType } = params

  const paths = window.location.hash.substring(2).split('/')

  const network = getNetworkFromUrl()

  // subdirectory
  let rSubdirectory =
    ROUTE.PAGE_PROPOSALS.substring(1) || ROUTE.PAGE_GAUGES.substring(1) || ROUTE.PAGE_VECRV.substring(1)
  let rSubdirectoryUseDefault = true

  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = paths[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(DAO_ROUTES).find(
      (k) => DAO_ROUTES[k as keyof typeof DAO_ROUTES].substring(1).toLowerCase() === subdirectory.toLowerCase(),
    )
    if (foundSubdirectory) {
      rSubdirectory = subdirectory
      rSubdirectoryUseDefault = false
    }
  }

  const parsedPathname = `${network.rNetwork}/${rSubdirectory}`
  const redirectPathname =
    window.location.hash.substring(1).startsWith(parsedPathname) ||
    (chainIdNotRequired && window.location.hash.substring(1).startsWith(rSubdirectory))
      ? ''
      : parsedPathname

  return {
    ...network,
    rSubdirectory,
    rSubdirectoryUseDefault,
    rProposalId: proposalId,
    rUserAddress: userAddress,
    rGaugeAddress: gaugeAddress,
    rFormType: formType,
    redirectPathname,
    restFullPathname: getRestFullPathname(),
  } as RouterParams
}

export function getNetworkFromUrl() {
  const restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
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
}

export function getRestFullPathname() {
  const restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  const { rNetworkIdx } = getNetworkFromUrl()
  return restPathnames.slice(rNetworkIdx + 1, restPathnames.length).join('/')
}
