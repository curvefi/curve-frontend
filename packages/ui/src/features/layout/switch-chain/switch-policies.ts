import type { ParsedLocation } from '@tanstack/react-router'
import { replaceNetworkInPath } from '@ui/features/layout/routes'
import { getSearchString } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

export type NetworkSwitchPolicy =
  | {
      type: 'same-page'
      /** Clear specific URL search params when switching, such as 'from' and 'to' on quickswap, and 'page' on table pages. */
      clearSearchParams?: readonly string[]
    }
  | {
      type: 'locked'
      /** Optional custom 'error' message to give more context about why network switching would be locked. */
      toastTitle?: () => string
    }

export const ETHEREUM_ONLY_NETWORK_SWITCH: NetworkSwitchPolicy = {
  type: 'locked',
  toastTitle: () => t`This section is only available on the Ethereum Mainnet`,
}

export const getNetworkSwitchHref = (
  location: Pick<ParsedLocation, 'searchStr' | 'href'>,
  targetBlockchainId: string,
  policy: NetworkSwitchPolicy,
): string => {
  if (policy.type !== 'same-page') return location.href

  const href = replaceNetworkInPath(location.href, targetBlockchainId)
  if (!policy.clearSearchParams?.length || !location.searchStr) return href

  // Delete search params if dedicated by the policy.
  const search = getSearchString(
    Object.fromEntries(policy.clearSearchParams.map(key => [key, null])),
    new URLSearchParams(location.searchStr),
  )
  return href.replace(location.searchStr, search)
}
