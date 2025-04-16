import { type UrlParams } from '@/dao/types/dao.types'
import { getInternalUrl } from '@ui-kit/shared/routes'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('dao', network, route)

export const getEthPath = (route: string) => getPath({ network: 'ethereum' }, route)

/**
 * Get the part of a path after the network, removing the leading slash and the first two parts.
 * For example /:app/:network/:page/:id => `:page/:id`
 */
export const getRestFullPathname = () => window.location.pathname.substring(1).split('/').slice(2).join('/')
