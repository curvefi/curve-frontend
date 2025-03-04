import type { FormType as ManageFormType } from '@/loan/components/PageLoanManage/types'
import { ROUTE } from '@/loan/constants'
import networks, { networksIdMapper } from '@/loan/networks'
import { CRVUSD_ROUTES } from '@ui-kit/shared/routes'
import { type NetworkUrlParams, RouterParams, type UrlParams } from '@/loan/types/loan.types'

export const getPath = ({ network = 'ethereum' }: UrlParams, rerouteRoute: string) =>
  `/crvusd/${network}${rerouteRoute}`

export function getCollateralListPathname(params: NetworkUrlParams) {
  const endPath = `${ROUTE.PAGE_MARKETS}`
  return getPath(params, endPath)
}

export function getLoanCreatePathname(
  params: NetworkUrlParams,
  collateralId: string,
  formType?: 'create' | 'leverage',
) {
  let endPath = `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_CREATE}`
  if (formType === 'leverage') {
    endPath += `/${formType}`
  }
  return getPath(params, endPath)
}

export const getLoanManagePathname = (params: NetworkUrlParams, collateralId: string, formType: ManageFormType) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_MANAGE}/${formType}`)

const splitPath = () => window.location.pathname.substring(1).split('/')

export function parseParams(params: UrlParams, chainIdNotRequired?: boolean) {
  const { collateralId, formType } = params
  const network = parseNetworkFromUrl(params)
  let rSubdirectory = ROUTE.PAGE_MARKETS.substring(1)
  let rSubdirectoryUseDefault = true

  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = splitPath()[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(CRVUSD_ROUTES).find(
      (k) => CRVUSD_ROUTES[k as keyof typeof CRVUSD_ROUTES].substring(1).toLowerCase() === subdirectory.toLowerCase(),
    )
    if (foundSubdirectory) {
      rSubdirectory = subdirectory
      rSubdirectoryUseDefault = false
    }
  }

  let rCollateralId = ''
  if (collateralId) {
    rCollateralId = collateralId.toLowerCase()
  }

  // formType
  let rFormType = ''
  if (formType) {
    const parsedFormType = formType[0].toLowerCase()
    if (
      parsedFormType === 'loan' ||
      parsedFormType === 'deleverage' ||
      parsedFormType === 'collateral' ||
      parsedFormType === 'leverage'
    ) {
      rFormType = parsedFormType
    }
  }

  return {
    ...network,
    rSubdirectory,
    rSubdirectoryUseDefault,
    rCollateralId,
    rFormType,
    restFullPathname: getRestFullPathname(params),
  } as RouterParams
}

export function parseNetworkFromUrl({ network }: UrlParams) {
  if (network && networksIdMapper[network]) {
    const rChainId = networksIdMapper[network]
    return {
      rNetworkIdx: 1,
      rNetwork: networks[rChainId].id,
      rChainId,
    }
  }
  return {
    rNetworkIdx: -1,
    rNetwork: networks[1].id,
    rChainId: 1 as const,
  }
}

export function getRestFullPathname(params: UrlParams) {
  const { rNetworkIdx } = parseNetworkFromUrl(params)
  return splitPath()
    .slice(rNetworkIdx + 1)
    .join('/')
}
