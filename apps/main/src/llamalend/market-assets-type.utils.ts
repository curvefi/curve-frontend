import { getAddress } from 'viem'
import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import { maybe, recordEntries, recordValues } from '@primitives/objects.utils'
// eslint-disable-next-line no-restricted-imports
import { MARKET_ASSETS_TYPE_BY_CONTROLLER } from './markets.constants'

export const getMarketAssetsType = (chainId: number, controllerAddress: Address | undefined) =>
  maybe(controllerAddress, address => MARKET_ASSETS_TYPE_BY_CONTROLLER[chainId]?.[getAddress(address)])

export const getMarketAddressesByAssetsType = (assetsType: MarketAssetsType) => [
  ...new Set(
    recordValues(MARKET_ASSETS_TYPE_BY_CONTROLLER).flatMap(chainMarkets =>
      recordEntries(chainMarkets)
        .filter(([, type]) => type === assetsType)
        .map(([address]) => address),
    ),
  ),
]
