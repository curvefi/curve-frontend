import type { ParsedLocation } from '@tanstack/react-router'
import { replaceNetworkInPath } from '@ui/features/layout/routes'
import { getSearchString } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

export type NetworkSwitchPolicy =
  { type: 'same-page'; clearSearchParams?: readonly string[] } | { type: 'locked'; toastTitle?: () => string }

export const ETHEREUM_ONLY_NETWORK_SWITCH: NetworkSwitchPolicy = {
  type: 'locked',
  toastTitle: () => t`This application is only available on the Ethereum Mainnet`,
}

export const getNetworkSwitchHref = (
  location: Pick<ParsedLocation, 'searchStr' | 'href'>,
  targetBlockchainId: string,
  policy: NetworkSwitchPolicy,
): string => {
  if (policy.type !== 'same-page') return location.href

  let href = replaceNetworkInPath(location.href, targetBlockchainId)
  if (policy.clearSearchParams?.length && location.searchStr) {
    const search = getSearchString(
      Object.fromEntries(policy.clearSearchParams.map(key => [key, null])),
      new URLSearchParams(location.searchStr),
    )
    href = href.replace(location.searchStr, search)
  }
  return href
}
