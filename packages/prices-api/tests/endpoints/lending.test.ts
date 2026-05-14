import * as lending from '../../src/lending'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import {
  endpointSeed,
  getCrvUsdMarketSeed,
  getLlamalendMarketSeed,
  getLlamalendOracleSeed,
  getLlamalendUserSeed,
  requestOptions,
} from '../seeds'

const crvUsdMarketSeed = endpointSeed(getCrvUsdMarketSeed)
const llamalendMarketSeed = endpointSeed(getLlamalendMarketSeed)
const llamalendOracleSeed = endpointSeed(getLlamalendOracleSeed)
const llamalendUserSeed = endpointSeed(getLlamalendUserSeed)

runEndpointCases('lending', [
  endpointCase('getLoanDistribution', 'crvusd', () =>
    lending.getLoanDistribution('crvusd', crvUsdMarketSeed().chain, crvUsdMarketSeed().controller, requestOptions),
  ),
  endpointCase('getLoanDistribution', 'lending', () =>
    lending.getLoanDistribution(
      'lending',
      llamalendMarketSeed().chain,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getOracle', 'crvusd', () =>
    lending.getOracle({ ...crvUsdMarketSeed(), endpoint: 'crvusd', interval: 1 }, requestOptions),
  ),
  endpointCase('getOracle', 'lending', () =>
    lending.getOracle({ ...llamalendOracleSeed(), endpoint: 'lending', interval: 1 }, requestOptions),
  ),
  endpointCase('getUserMarketCollateralEvents', () =>
    lending.getUserMarketCollateralEvents(
      llamalendUserSeed().user,
      llamalendUserSeed().chain,
      llamalendUserSeed().controller,
      undefined,
      requestOptions,
    ),
  ),
  endpointCase('getRateCurve', () =>
    lending.getRateCurve(llamalendMarketSeed().chain, llamalendMarketSeed().controller, requestOptions),
  ),
])
