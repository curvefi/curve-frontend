import type { Params } from 'react-router'

import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { ROUTE } from '@/constants'
import { DEFAULT_LOCALES, Locale, parseLocale } from '@ui-kit/lib/i18n'
import networks, { networksIdMapper } from '@/networks'
import { NetworkEnum, RouterParams } from '@/types/dao.types'

export function getPath({ locale, network, ...rest }: Params, rerouteRoute: string) {
  const { parsedLocale } = parseLocale(locale)
  const parsedNetwork = network ? `/${network}` : ''
  return parsedLocale && parsedLocale !== 'en'
    ? `/${parsedLocale}${parsedNetwork}${rerouteRoute}`
    : `${parsedNetwork}${rerouteRoute}`
}

export function parseParams(params: Params, chainIdNotRequired?: boolean) {
  const { proposalId, userAddress, gaugeAddress, formType } = params

  const paths = window.location.hash.substring(2).split('/')

  const locale = getLocaleFromUrl()
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
    rProposalId: proposalId,
    rUserAddress: userAddress,
    rGaugeAddress: gaugeAddress,
    rFormType: formType,
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
  ;['pools', 'swap'].forEach((p) => {
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
