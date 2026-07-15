import type { IChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@curvefi/primitives/address.utils'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'
import type { MarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import {
  type BandRangeOrEmpty,
  getAmmAddress,
  getControllerAddress,
  getCrvTokenAddress,
  getGaugeAddress,
  getMarketBandRange,
  getTokens,
  getVaultToken,
  getZapAddress,
  type MarketTokensOrEmpty,
} from '../../llama.utils'
import type { MarketTemplate } from '../../llamalend.types'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'

export const createMarketContextValue = <ChainId extends IChainId>({
  chainId,
  blockchainId,
  marketQuery,
  apiMarket,
  marketType,
  userAddress,
  api,
}: {
  chainId: ChainId
  blockchainId: LlamaNetworkId
  userAddress: Address | undefined
  api: LlamaApi | null
  marketQuery: QueryProp<MarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  marketType: MarketType
}) => ({
  chainId,
  blockchainId,
  userAddress,
  api,
  market: marketQuery.data,
  marketQuery,
  apiMarket,
  marketType,
  marketId: marketQuery.data?.id,
  ammAddress: getAmmAddress(marketQuery.data, apiMarket.data),
  zapAddress: getZapAddress(marketQuery.data),
  controllerAddress: getControllerAddress(marketQuery.data, apiMarket.data),
  tokens: (getTokens(marketQuery.data, apiMarket.data) ?? {}) as MarketTokensOrEmpty,
  vaultToken: getVaultToken(marketQuery.data, apiMarket.data),
  gaugeAddress: getGaugeAddress(marketQuery.data),
  bands: (getMarketBandRange(marketQuery.data, apiMarket.data) ?? {}) as BandRangeOrEmpty,
  crvTokenAddress: getCrvTokenAddress(marketQuery.data),
})

export type MarketContextValue<T extends IChainId> = ReturnType<typeof createMarketContextValue<T>>
