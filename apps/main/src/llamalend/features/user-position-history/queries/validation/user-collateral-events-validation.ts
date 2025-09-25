import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address, Chain } from '@curvefi/prices-api'
import { chainNameValidationGroup } from '@ui-kit/lib/model/query/chain-name-validation'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

export type UserCollateralEventsValidationParams = {
  chainId: IChainId
  blockchainId: Chain
  contractAddress: Address | undefined
  userAddress: Address | undefined
}

export const userCollateralEventsValidationSuite = createValidationSuite(
  (params: UserCollateralEventsValidationParams) => {
    llamaApiValidationGroup({ chainId: params.chainId })
    chainNameValidationGroup({ blockchainId: params.blockchainId })
    contractValidationGroup({ blockchainId: params.blockchainId, contractAddress: params.contractAddress })
    userAddressValidationGroup({ userAddress: params.userAddress })
  },
)
