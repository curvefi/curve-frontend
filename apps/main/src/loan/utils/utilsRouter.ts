import { ChainId, type NetworkUrlParams } from '@/loan/types/loan.types'
import { llamalendRoutes } from '@evm-ui/shared/routes'
import { Chain } from '@primitives/network.utils'

export const getCollateralListPathname = ({ network }: NetworkUrlParams) =>
  llamalendRoutes.markets({ blockchainId: network })

export const getChainId = ({ network }: NetworkUrlParams) => ({ ethereum: Chain.Ethereum as const })[network] as ChainId
