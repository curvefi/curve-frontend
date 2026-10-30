import { ChainId, type NetworkUrlParams } from '@/loan/types/loan.types'
import { LLAMALEND_ROUTES } from '@evm-ui/shared/routes'
import { Chain } from '@primitives/network.utils'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  LLAMALEND_ROUTES.PAGE_MARKETS({ blockchainId: network })

export const getChainId = ({ network }: NetworkUrlParams) => ({ ethereum: Chain.Ethereum as const })[network] as ChainId
