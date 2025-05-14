import type { FormType as ManageFormType } from '@/loan/components/PageLoanManage/types'
import { ROUTE } from '@/loan/constants'
import { ChainId, type CollateralUrlParams, type NetworkUrlParams, type UrlParams } from '@/loan/types/loan.types'
import { getInternalUrl } from '@ui-kit/shared/routes'
import { Chain } from '@ui-kit/utils'

/** Get the path for the given route in this app */
export const getPath = ({ network }: UrlParams, route: string) => getInternalUrl('crvusd', network, route)

export const getCollateralListPathname = (params: NetworkUrlParams) => getPath(params, ROUTE.PAGE_MARKETS)

export const useChainId = ({ network }: NetworkUrlParams) =>
  ({
    ethereum: Chain.Ethereum as const,
  })[network] as ChainId

export const getLoanCreatePathname = (
  params: NetworkUrlParams,
  collateralId: string,
  formType?: 'create' | 'leverage',
) =>
  getPath(
    params,
    `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_CREATE}${formType === 'leverage' ? '/leverage' : ''}`,
  )

export const getLoanManagePathname = (params: NetworkUrlParams, collateralId: string, formType: ManageFormType) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${collateralId}${ROUTE.PAGE_MANAGE}/${formType}`)

/**
 * Get the part of a path after the network, removing the leading slash and the first two parts.
 * For example /:app/:network/:page/:id => `:page/:id`
 */
export const getRestFullPathname = () => window.location.pathname.substring(1).split('/').slice(2).join('/')

export const parseCollateralParams = ({ collateralId, formType: [rFormType] = [] }: CollateralUrlParams) => ({
  rFormType,
  rCollateralId: collateralId.toLowerCase(),
})
