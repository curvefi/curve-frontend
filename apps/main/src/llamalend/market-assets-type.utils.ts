import { getAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
// eslint-disable-next-line no-restricted-imports
import { MARKET_ASSETS_TYPE_BY_CONTROLLER } from './markets.constants'

export const getMarketAssetsType = (chainId: number, controllerAddress: Address | undefined) =>
  maybe(controllerAddress, address => MARKET_ASSETS_TYPE_BY_CONTROLLER[chainId]?.[getAddress(address)])
