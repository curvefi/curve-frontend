import type { Params } from 'react-router'
import type { Location } from 'react-router'
import type { FormType as ManageFormType } from '@/components/PageLoanManage/types'

import { parseLocale, parseLocaleFromPathname } from '@/lib/i18n'
import { ROUTE } from '@/constants'
import { networksIdMapper } from '@/networks'

export function getPath({ locale = 'en', network = 'ethereum', ...rest }: Params<string>, rerouteRoute: string) {
  const { parsedLocale } = parseLocale(locale)
  return parsedLocale && parsedLocale !== 'en'
    ? `/${parsedLocale}/${network}${rerouteRoute}`
    : `/${network}${rerouteRoute}`
}

export function getCollateralListPathname(params: Params) {
  const endPath = `${ROUTE.PAGE_MARKETS}`
  return getPath(params, endPath)
}

export function getLoanCreatePathname(params: Params, collateralId: string, formType?: 'create' | 'leverage') {
  let endPath = `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_CREATE}`

  if (formType === 'leverage') {
    endPath += `/${formType}`
  }
  return getPath(params, endPath)
}

export function getLoanManagePathname(params: Params, collateralId: string, formType: ManageFormType) {
  const endPath = `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_MANAGE}/${formType}`
  return getPath(params, endPath)
}

export function parseParams(params: Params | undefined, location: Location | undefined) {
  const { network, collateralId, formType } = params ?? {}

  // get network chainId
  let rChainId: ChainId | '' = ''
  if (network) {
    const foundChainId = networksIdMapper[network.toLowerCase() as NetworkEnum]
    if (foundChainId) {
      rChainId = foundChainId as ChainId
    }
  }

  let rCollateralId = ''
  if (collateralId) {
    rCollateralId = collateralId.toLowerCase()
  }

  // formType
  let rFormType = null
  if (formType) {
    const parsedFormType = formType.toLowerCase()
    if (
      parsedFormType === 'loan' ||
      parsedFormType === 'deleverage' ||
      parsedFormType === 'collateral' ||
      parsedFormType === 'leverage'
    ) {
      rFormType = parsedFormType
    }
  }

  let rLocale = parseLocaleFromPathname(location?.pathname)

  return { rChainId, rCollateralId, rFormType, rLocale }
}
