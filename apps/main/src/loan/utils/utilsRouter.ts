import { ROUTE } from '@/loan/constants'
import { ChainId, type NetworkUrlParams, type UrlParams } from '@/loan/types/loan.types'
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

export const getMintMarketPathname = (params: NetworkUrlParams, collateralId: string) =>
  getPath(params, `${ROUTE.PAGE_MARKETS}/${collateralId}`)
