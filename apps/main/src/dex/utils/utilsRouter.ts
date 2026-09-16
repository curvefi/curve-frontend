import { type UrlParams } from '@/dex/types/main.types'
import { getInternalUrl } from '@evm-ui/shared/routes'
import { usePathname } from '@ui/hooks/router'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('dex', network, route)

/**
 * Get the part of a path after the network, removing the leading slash and the first two parts.
 * For example /:app/:network/:page/:id => `:page/:id`
 */
export const useRestFullPathname = () => usePathname()?.substring(1).split('/').slice(2).join('/')
