import type { IChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@evm-ui/features/connect-wallet'
import type { MarketType } from '@evm-ui/types/market'
import type { QueryProp } from '@evm-ui/types/util'
import type { ReleaseChannel } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import {
  type BandRangeOrEmpty,
  getAmmAddress,
  getControllerAddress,
  getCrvTokenAddress,
  getGaugeAddress,
  getMarketBandRange,
  getMarketLeverageProviders,
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
  releaseChannel,
}: {
  chainId: ChainId
  blockchainId: LlamaNetworkId
  userAddress: Address | undefined
  api: LlamaApi | null
  releaseChannel: ReleaseChannel
  marketQuery: QueryProp<MarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  marketType: MarketType
}) => {
  const controllerAddress = getControllerAddress(marketQuery.data, apiMarket.data)
  return {
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
    controllerAddress,
    leverageProviders: getMarketLeverageProviders(chainId, controllerAddress, releaseChannel),
    tokens: (getTokens(marketQuery.data, apiMarket.data) ?? {}) as MarketTokensOrEmpty,
    vaultToken: getVaultToken(marketQuery.data, apiMarket.data),
    gaugeAddress: getGaugeAddress(marketQuery.data),
    bands: (getMarketBandRange(marketQuery.data, apiMarket.data) ?? {}) as BandRangeOrEmpty,
    crvTokenAddress: getCrvTokenAddress(marketQuery.data),
  }
}

export type MarketContextValue<T extends IChainId> = ReturnType<typeof createMarketContextValue<T>>
