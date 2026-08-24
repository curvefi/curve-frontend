import type { Chain } from '@curvefi/prices-api'
import { contractValidationGroup } from '@evm-ui/lib/model/query/contract-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { pricesApiChainNameValidationGroup } from '@evm-ui/lib/model/query/prices-chain-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { Address } from '@primitives/address.utils'

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
