import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { chainNameValidationGroup } from '@ui-kit/lib/model/query/chain-name-validation'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

export type UserCollateralEventsValidationParams = {
  blockchainId: Chain
  contractAddress: Address | undefined
  userAddress: Address | undefined
}

export const userCollateralEventsValidationSuite = createValidationSuite(
  (params: UserCollateralEventsValidationParams) => {
    chainNameValidationGroup({ blockchainId: params.blockchainId })
    contractValidationGroup({ blockchainId: params.blockchainId, contractAddress: params.contractAddress })
    userAddressValidationGroup({ userAddress: params.userAddress })
  },
)
