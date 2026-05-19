import * as llamma from '../../src/llamma'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import { endpointSeed, getCrvUsdMarketSeed, getLlamalendMarketSeed, requestOptions } from '../seeds'

const crvUsdMarketSeed = endpointSeed(getCrvUsdMarketSeed)
const llamalendMarketSeed = endpointSeed(getLlamalendMarketSeed)

runEndpointCases('llamma', [
  endpointCase('getEvents', 'crvusd', () =>
    llamma.getEvents({ ...crvUsdMarketSeed(), endpoint: 'crvusd', perPage: 10 }, requestOptions),
  ),
  endpointCase('getEvents', 'lending', () =>
    llamma.getEvents({ ...llamalendMarketSeed(), endpoint: 'lending', perPage: 10 }, requestOptions),
  ),
  endpointCase('getTrades', 'crvusd', () =>
    llamma.getTrades({ ...crvUsdMarketSeed(), endpoint: 'crvusd', perPage: 10 }, requestOptions),
  ),
  endpointCase('getTrades', 'lending', () =>
    llamma.getTrades({ ...llamalendMarketSeed(), endpoint: 'lending', perPage: 10 }, requestOptions),
  ),
  endpointCase('getOHLC', 'crvusd', () =>
    llamma.getOHLC({ ...crvUsdMarketSeed(), endpoint: 'crvusd', interval: 1 }, requestOptions),
  ),
  endpointCase('getOHLC', 'lending', () =>
    llamma.getOHLC({ ...llamalendMarketSeed(), endpoint: 'lending', interval: 1 }, requestOptions),
  ),
])
