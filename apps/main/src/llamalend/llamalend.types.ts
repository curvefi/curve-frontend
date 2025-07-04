import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'

export type NetworkEnum = INetworkName

export type NetworkUrlParams = { network: NetworkEnum }

export type Market = MintMarketTemplate | LendMarketTemplate
