import { ROUTE } from '@/lend/constants'
import { networksIdMapper } from '@/lend/networks'
import { type MarketUrlParams, type UrlParams } from '@/lend/types/lend.types'
import { getInternalUrl } from '@ui-kit/shared/routes'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('lend', network, route)

export const getCollateralListPathname = (params: UrlParams) => getPath(params, ROUTE.PAGE_MARKETS)

export const getLoanCreatePathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_CREATE}${formType === 'create' ? '' : `/${formType}`}`)

export const getLoanManagePathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_MANAGE}/${formType}`)

export const getVaultPathname = (params: UrlParams, owmId: string, formType: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${owmId}${ROUTE.PAGE_VAULT}${formType === 'vault' ? '' : `/${formType}`}`)

export const parseMarketParams = ({ formType, market, network }: MarketUrlParams) => ({
  rMarket: market.toLowerCase(),
  rChainId: networksIdMapper[network],
  rFormType: formType ?? '',
})
