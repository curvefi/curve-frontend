import { ChainId, type NetworkUrlParams } from '@/loan/types/loan.types'
import { getInternalUrl, LLAMALEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@ui-kit/utils'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

export const useChainId = ({ network }: NetworkUrlParams) =>
  ({
    ethereum: Chain.Ethereum as const,
  })[network] as ChainId
