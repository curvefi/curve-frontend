import { ChainId, type NetworkUrlParams } from '@/loan/types/loan.types'
import { getInternalUrl, LLAMALEND_ROUTES } from '@evm-ui/shared/routes'
import { Chain } from '@evm-ui/utils'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  getInternalUrl('llamalend', network, LLAMALEND_ROUTES.PAGE_MARKETS)

export const getChainId = ({ network }: NetworkUrlParams) =>
  ({
    ethereum: Chain.Ethereum as const,
  })[network] as ChainId
