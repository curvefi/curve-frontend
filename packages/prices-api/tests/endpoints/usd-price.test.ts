import * as usdPrice from '../../src/usd-price'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, requestOptions } from '../seeds'

const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('usd-price', [
  endpointCase('getUsdPrice', () => usdPrice.getUsdPrice(poolSeed().chain, poolSeed().mainToken, requestOptions)),
  endpointCase('getUsdPriceHistory', () =>
    usdPrice.getUsdPriceHistory(poolSeed().chain, poolSeed().mainToken, 7, requestOptions),
  ),
])
