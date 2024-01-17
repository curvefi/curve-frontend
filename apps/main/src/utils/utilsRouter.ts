import type { Location, Params } from 'react-router'

import { networksIdMapper } from '@/networks'
import { parseLocale, parseLocaleFromPathname } from '@/lib/i18n'

export function getPath({ locale, network, ...rest }: Params, rerouteRoute: string) {
  const { parsedLocale } = parseLocale(locale)
  const parsedNetwork = network ? `/${network}` : ''
  return parsedLocale && parsedLocale !== 'en'
    ? `/${parsedLocale}${parsedNetwork}${rerouteRoute}`
    : `${parsedNetwork}${rerouteRoute}`
}

export function parseParams(params: Params | undefined, location: Location | undefined) {
  const { network, pool, transfer, lockedCrvFormType } = params ?? {}

  // get network chainId
  let rChainId: ChainId | '' = ''
  if (network) {
    const foundChainId = networksIdMapper[network.toLowerCase() as NetworkEnum]
    if (foundChainId) {
      rChainId = foundChainId as ChainId
    }
  }

  let rPoolId = null
  if (pool) {
    rPoolId = pool
  }

  let rFormType: RouterParams['rFormType'] | null = null

  // formType
  if (transfer) {
    const parsedTransfer = transfer.toLowerCase()
    if (parsedTransfer === 'deposit') {
      rFormType = 'deposit'
    } else if (parsedTransfer === 'withdraw') {
      rFormType = 'withdraw'
    } else if (parsedTransfer === 'swap') {
      rFormType = 'swap'
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

  let rLocale = parseLocaleFromPathname(location?.pathname)

  return { rChainId, rLocale, rPoolId, rFormType }
}
