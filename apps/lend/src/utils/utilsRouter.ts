import type { Params } from 'react-router'
import { DEFAULT_LOCALES, LocaleOption, parseLocale } from '@/lib/i18n'
import { ROUTE } from '@/constants'
import networks, { networksIdMapper } from '@/networks'
import { LEND_ROUTES } from '@ui-kit/shared/routes'


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

export function getLoanCreatePathname(params: Params, owmId: string, formType: string) {
  let endPath = `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_CREATE}${formType === 'create' ? '' : `/${formType}`}`
  return getPath(params, endPath)
}

export function getLoanManagePathname(params: Params, owmId: string, formType: string) {
  const endPath = `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_MANAGE}/${formType}`
  return getPath(params, endPath)
}

export function getVaultPathname(params: Params, owmId: string, formType: string) {
  const endPath = `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_VAULT}${formType === 'vault' ? '' : `/${formType}`}`
  return getPath(params, endPath)
}

export function parseParams(params: Params, chainIdNotRequired?: boolean) {
  const { owmId, formType } = params ?? {}
  const paths = window.location.hash.substring(2).split('/')

  const locale = getLocaleFromUrl()
  const network = getNetworkFromUrl()

  // subdirectory
  let rSubdirectory = ROUTE.PAGE_MARKETS.substring(1)
  let rSubdirectoryUseDefault = true

  if (network.rNetworkIdx !== -1 || chainIdNotRequired) {
    const subdirectory = paths[network.rNetworkIdx + 1]?.split('?')[0] ?? ''
    const foundSubdirectory = Object.keys(LEND_ROUTES).find((k) => {
      return LEND_ROUTES[k as keyof typeof LEND_ROUTES].substring(1).toLowerCase() === subdirectory.toLowerCase()
    })
    if (foundSubdirectory) {
      rSubdirectory = subdirectory
      rSubdirectoryUseDefault = false
    }
  }

  let rOwmId = ''
  if (owmId) {
    rOwmId = owmId.toLowerCase()
  }

  // formType
  let rFormType = ''
  if (formType) {
    const parsedFormType = formType.toLowerCase()
    const keys = ['vault', 'loan', 'collateral', 'deposit', 'withdraw', 'leverage']
    if (keys.some((key) => parsedFormType === key)) {
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
    rOwmId,
    rFormType,
    redirectPathname,
    restFullPathname: getRestFullPathname(),
  } as RouterParams
}

export function getLocaleFromUrl() {
  const restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  let resp: { rLocale: LocaleOption | null; rLocalePathname: string } = {
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

export function getRestPartialPathname() {
  let restPathnames = window.location.hash?.substring(2)?.split('/') ?? []
  const lastIdx = restPathnames.length - 1
  if (restPathnames[lastIdx] && restPathnames[lastIdx].includes('?')) {
    restPathnames[lastIdx] = restPathnames[lastIdx].split('?')[0]
  }
  const { rNetworkIdx } = getNetworkFromUrl()
  let endIdx = restPathnames.length
  let found = false
  ;['markets'].forEach((p) => {
    if (!found && restPathnames.indexOf(p) !== -1) {
      found = true
      endIdx = restPathnames.indexOf(p) + 1
    }
  })
  return restPathnames.slice(rNetworkIdx + 1, endIdx).join('/')
}

export function getParamsFromUrl() {
  return { ...getNetworkFromUrl(), ...getLocaleFromUrl() }
}
