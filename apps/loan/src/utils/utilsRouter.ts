import type { Params } from 'react-router'
import type { FormType as ManageFormType } from '@/components/PageLoanManage/types'
import { MAIN_ROUTE, ROUTE } from '@/constants'
import type { Locale } from '@/lib/i18n'

import { DEFAULT_LOCALES, parseLocale } from '@/lib/i18n'
import networks, { networksIdMapper } from '@/networks'

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

export function parseParams(params: Params, chainIdNotRequired?: boolean) {
  const { collateralId, formType } = params ?? {}
  const paths = window.location.hash.substring(2).split('/')

  const locale = getLocaleFromUrl()
  const network = getNetworkFromUrl()

  // subdirectory
  let rSubdirectory = ROUTE.PAGE_MARKETS.substring(1)
  let rSubdirectoryUseDefault = true

  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = paths[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(MAIN_ROUTE).find((k) => {
      return MAIN_ROUTE[k as keyof typeof MAIN_ROUTE].substring(1).toLowerCase() === subdirectory.toLowerCase()
    })
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

  const parsedPathname = `${locale.rLocalePathname}/${network.rNetwork}/${rSubdirectory}`
  const redirectPathname =
    window.location.hash.substring(1).startsWith(parsedPathname) ||
    (chainIdNotRequired && window.location.hash.substring(1).startsWith(`${locale.rLocalePathname}/${rSubdirectory}`))
      ? ''
      : parsedPathname

  return {
    ...locale,
    ...network,
    rSubdirectory,
    rSubdirectoryUseDefault,
    rCollateralId,
    rFormType,
    redirectPathname,
    restFullPathname: getRestFullPathname(),
  } as RouterParams
}

export function getLocaleFromUrl() {
  const restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  let resp: { rLocale: Locale | null; rLocalePathname: string } = {
    rLocale: null,
    rLocalePathname: '',
  }

  const foundLocale = DEFAULT_LOCALES.find((l) => l.value.toLowerCase() === (restPathnames[0] ?? '').toLowerCase())

  if (foundLocale && foundLocale.value !== 'en') {
    resp.rLocale = foundLocale
    resp.rLocalePathname = `/${foundLocale.value}`
  }
  return resp
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
    const rChainId: 1 = networksIdMapper[secondPath]
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

export function getParamsFromUrl() {
  return { ...getNetworkFromUrl(), ...getLocaleFromUrl() }
}
