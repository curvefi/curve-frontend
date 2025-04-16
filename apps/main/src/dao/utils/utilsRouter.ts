import { type UrlParams } from '@/dao/types/dao.types'
import { getInternalUrl } from '@ui-kit/shared/routes'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('dao', network, route)

export const getEthPath = (route: string) => getPath({ network: 'ethereum' }, route)

export const getRestFullPathname = () =>
  window.location.pathname
    .substring(1)
    .split('/')
    .slice(1, window.location.pathname.substring(1).split('/').length)
    .join('/')
