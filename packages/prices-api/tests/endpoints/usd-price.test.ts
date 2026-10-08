import * as usdPrice from '../../src/usd-price'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, requestOptions } from '../seeds'

const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('usd-price', [
  endpointCase('getUsdPrice', () =>
    usdPrice.getUsdPrice(poolSeed().blockchainId, poolSeed().mainToken, requestOptions),
  ),
  endpointCase('getUsdPriceHistory', () =>
    usdPrice.getUsdPriceHistory(poolSeed().blockchainId, poolSeed().mainToken, 7, requestOptions),
  ),
])
