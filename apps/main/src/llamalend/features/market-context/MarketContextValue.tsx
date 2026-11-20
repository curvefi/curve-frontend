import type { IChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LlamaApi } from '@evm-ui/features/connect-wallet/lib/types'
import type { MarketType } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import type { QueryProp } from '@ui/features/queries/util'
import type { ReleaseChannel } from '@ui/lib/env'
import {
  type BandRangeOrEmpty,
  getAmmAddress,
  getControllerAddress,
  getCrvTokenAddress,
  getGaugeAddress,
  getMarketBandRange,
  getMarketLeverageProviders,
  getVaultToken,
  getZapAddress,
  type MarketTokens,
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
  tokens,
}: {
  chainId: ChainId
  blockchainId: LlamaNetworkId
  userAddress: Address | undefined
  api: LlamaApi | null
  releaseChannel: ReleaseChannel
  /** The market tokens, with the coins of LP tokens, see `useMarketTokens` */
  tokens: MarketTokens | undefined
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
    tokens: (tokens ?? {}) as MarketTokensOrEmpty,
    vaultToken: getVaultToken(marketQuery.data, apiMarket.data),
    gaugeAddress: getGaugeAddress(marketQuery.data, apiMarket.data),
    bands: (getMarketBandRange(marketQuery.data, apiMarket.data) ?? {}) as BandRangeOrEmpty,
    crvTokenAddress: getCrvTokenAddress(marketQuery.data),
  }
}

export type MarketContextValue<T extends IChainId> = ReturnType<typeof createMarketContextValue<T>>
