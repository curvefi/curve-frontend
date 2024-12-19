import type { Params } from 'react-router'

import { MAIN_ROUTE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES, Locale, parseLocale } from '@/lib/i18n'
import useStore from '@/store/useStore'
import { useMemo } from 'react'

export function getPath({ locale, network }: Params, rerouteRoute: string) {
  const { parsedLocale } = parseLocale(locale)
  const parsedNetwork = network ? `/${network}` : ''
  return parsedLocale && parsedLocale !== 'en'
    ? `/${parsedLocale}${parsedNetwork}${rerouteRoute}`
    : `${parsedNetwork}${rerouteRoute}`
}

export function useParsedParams(params: Params, chainIdNotRequired?: boolean) {
  const { pool, transfer, lockedCrvFormType } = params
  const paths = window.location.hash.substring(2).split('/')

  const locale = getLocaleFromUrl()
  const network = useNetworkFromUrl()

  // subdirectory
  let rSubdirectory = ROUTE.PAGE_SWAP.substring(1)
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

  let rPoolId = ''
  if (pool) {
    rPoolId = pool
  }

  let rFormType: RouterParams['rFormType'] = ''

  // formType
  if (transfer) {
    const parsedTransfer = transfer.toLowerCase()
    if (parsedTransfer === 'deposit') {
      rFormType = 'deposit'
    } else if (parsedTransfer === 'withdraw') {
      rFormType = 'withdraw'
    } else if (parsedTransfer === 'swap') {
      rFormType = 'swap'
    } else if (parsedTransfer === 'manage-gauge') {
      rFormType = 'manage-gauge'
    }
  }

  // locked crv formType
  if (lockedCrvFormType) {
    const formType = lockedCrvFormType.toLowerCase()
    if (formType === 'adjust_crv') {
      rFormType = 'adjust_crv'
    } else if (formType === 'adjust_date') {
      rFormType = 'adjust_date'
    } else if (formType === 'create') {
      rFormType = 'create'
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
    rPoolId,
    rFormType,
    redirectPathname,
    restFullPathname: useRestFullPathname(),
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

export function useParamsFromUrl() {
  return { ...useNetworkFromUrl(), ...getLocaleFromUrl() }
}
