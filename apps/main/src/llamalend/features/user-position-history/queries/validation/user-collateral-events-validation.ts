import type { Chain } from '@curvefi/prices-api'
import { contractValidationGroup } from '@evm-ui/queries/validation/contract-validation'
import { evmAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@evm-ui/queries/validation/prices-chain-validation'
import type { Address } from '@primitives/address.utils'
import { createValidationSuite } from '@ui/lib/validation/lib'

type UserCollateralEventsValidationParams = {
  blockchainId: Chain
  contractAddress: Address | undefined
  userAddress: Address | undefined
}

export const userCollateralEventsValidationSuite = createValidationSuite(
  (params: UserCollateralEventsValidationParams) => {
    pricesApiChainNameValidationGroup({ blockchainId: params.blockchainId })
    contractValidationGroup({ blockchainId: params.blockchainId, contractAddress: params.contractAddress })
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  },
)
