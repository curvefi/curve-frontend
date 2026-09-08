import * as ohlc from '../../src/ohlc'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getPoolSeed, requestOptions } from '../seeds'

const poolSeed = endpointSeed(getPoolSeed)

runEndpointCases('ohlc', [
  endpointCase('getOHLC', () =>
    ohlc.getOHLC(
      poolSeed().chain,
      poolSeed().poolAddress,
      poolSeed().mainToken,
      poolSeed().referenceToken,
      requestOptions,
    ),
  ),
  endpointCase('getLpOHLC', () =>
    ohlc.getLpOHLC(
      {
        chain: poolSeed().chain,
        poolAddress: poolSeed().poolAddress,
        priceUnits: 'usd',
      },
      requestOptions,
    ),
  ),
])
