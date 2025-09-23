import type { FormType as ManageFormType } from '@/loan/components/PageLoanManage/types'
import { ROUTE } from '@/loan/constants'
import { ChainId, type MarketUrlParams, type NetworkUrlParams, type UrlParams } from '@/loan/types/loan.types'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@ui-kit/utils'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('crvusd', network, route)

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

export const useChainId = ({ network }: NetworkUrlParams) =>
  ({
    ethereum: Chain.Ethereum as const,
  })[network] as ChainId

export const getLoanCreatePathname = (
  params: NetworkUrlParams,
  market: string,
  formType?: 'create' | 'leverage' | 'borrow',
) =>
  getPath(
    params,
    `${ROUTE.PAGE_MARKETS}/${market}${ROUTE.PAGE_CREATE}${formType && formType !== 'create' ? `/${formType}` : ''}`,
  )

export const getLoanManagePathname = (params: NetworkUrlParams, market: string, formType: ManageFormType) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${market}${ROUTE.PAGE_MANAGE}/${formType}`)

export const parseMarketParams = ({ market, formType: rFormType }: MarketUrlParams) => ({
  rFormType: rFormType ?? '',
  rMarket: market.toLowerCase(),
})
