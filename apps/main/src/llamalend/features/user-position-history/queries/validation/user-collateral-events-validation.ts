import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { contractValidationGroup } from '@ui-kit/lib/model/query/contract-validation'
import { pricesApiChainNameValidationGroup } from '@ui-kit/lib/model/query/prices-chain-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

type UserCollateralEventsValidationParams = {
  blockchainId: Chain
  contractAddress: Address | undefined
  userAddress: Address | undefined
}

export const userCollateralEventsValidationSuite = createValidationSuite(
  (params: UserCollateralEventsValidationParams) => {
    pricesApiChainNameValidationGroup({ blockchainId: params.blockchainId })
    contractValidationGroup({ blockchainId: params.blockchainId, contractAddress: params.contractAddress })
    userAddressValidationGroup({ userAddress: params.userAddress })
  },
)
