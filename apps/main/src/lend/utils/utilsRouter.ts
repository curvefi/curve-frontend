import { ROUTE } from '@/lend/constants'
import networks, { networksIdMapper } from '@/lend/networks'
import { LEND_ROUTES } from '@ui-kit/shared/routes'
import { NetworkEnum, RouterParams, type UrlParams } from '@/lend/types/lend.types'

export const getPath = ({ network }: UrlParams, rerouteRoute: string) => `/lend/${network}${rerouteRoute}`

export const getCollateralListPathname = (params: UrlParams) => getPath(params, ROUTE.PAGE_MARKETS)

export const getLoanCreatePathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_CREATE}${formType === 'create' ? '' : `/${formType}`}`)

export const getLoanManagePathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_MANAGE}/${formType}`)

export const getVaultPathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_VAULT}${formType === 'vault' ? '' : `/${formType}`}`)

export function parseParams(params: UrlParams, chainIdNotRequired?: boolean) {
  const { market, formType } = params ?? {}
  const paths = window.location.pathname.substring(1).split('/')

  const network = getNetworkFromUrl()

  // subdirectory
  let rSubdirectory = ROUTE.PAGE_MARKETS.substring(1)
  let rSubdirectoryUseDefault = true

  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = paths[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(LEND_ROUTES).find(
      (k) => LEND_ROUTES[k as keyof typeof LEND_ROUTES].substring(1).toLowerCase() === subdirectory.toLowerCase(),
    )
    if (foundSubdirectory) {
      rSubdirectory = subdirectory
      rSubdirectoryUseDefault = false
    }
  }

  // formType
  let rFormType = ''
  if (formType?.[0]) {
    const parsedFormType = formType[0].toLowerCase()
    const keys = ['vault', 'loan', 'collateral', 'deposit', 'withdraw', 'leverage']
    if (keys.some((key) => parsedFormType === key)) {
      rFormType = parsedFormType
    }
  }

  const parsedPathname = `${network.rNetwork}/${rSubdirectory}`
  const redirectPathname =
    window.location.pathname.startsWith(parsedPathname) ||
    (chainIdNotRequired && window.location.pathname.startsWith(rSubdirectory))
      ? ''
      : parsedPathname

  return {
    ...network,
    rSubdirectory,
    rSubdirectoryUseDefault,
    rMarket: market?.toLowerCase(),
    rFormType,
    redirectPathname,
    restFullPathname: getRestFullPathname(),
  } as RouterParams
}

export function getNetworkFromUrl() {
  const restPathnames = window.location.pathname.substring(1).split('/') ?? []
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
  const restPathnames = window.location.pathname.substring(1).split('/') ?? []
  const { rNetworkIdx } = getNetworkFromUrl()
  return restPathnames.slice(rNetworkIdx + 1, restPathnames.length).join('/')
}
