import * as llamalend from '../../src/llamalend'
import { endpointCase, runEndpointCases } from '../endpoint-cases'
import {
  endpointSeed,
  getCrvUsdMarketSeed,
  getLlamalendChainSeed,
  getLlamalendMarketSeed,
  getLlamalendUserSeed,
  requestOptions,
} from '../seeds'

const crvUsdMarketSeed = endpointSeed(getCrvUsdMarketSeed)
const llamalendChainSeed = endpointSeed(getLlamalendChainSeed)
const llamalendMarketSeed = endpointSeed(getLlamalendMarketSeed)
const llamalendUserSeed = endpointSeed(getLlamalendUserSeed)

runEndpointCases('llamalend', [
  endpointCase('getChains', () => llamalend.getChains(requestOptions)),
  endpointCase('getAllMarkets', () => llamalend.getAllMarkets({ page: 1, per_page: 50 }, requestOptions)),
  endpointCase('getMarkets', () =>
    llamalend.getMarkets(llamalendChainSeed(), { page: 1, per_page: 50 }, requestOptions),
  ),
  endpointCase('getSnapshots', () =>
    llamalend.getSnapshots(
      llamalendMarketSeed().chain,
      llamalendMarketSeed().controller,
      { agg: 'day', fetch_on_chain: true, limit: 10 },
      requestOptions,
    ),
  ),
  endpointCase('getAllUserMarkets', () =>
    llamalend.getAllUserMarkets(llamalendUserSeed().user, undefined, requestOptions),
  ),
  endpointCase('getUserMarkets', () =>
    llamalend.getUserMarkets(llamalendUserSeed().user, llamalendUserSeed().chain, requestOptions),
  ),
  endpointCase('getAllUserLendingPositions', () =>
    llamalend.getAllUserLendingPositions(llamalendUserSeed().user, undefined, requestOptions),
  ),
  endpointCase('getUserLendingPositions', () =>
    llamalend.getUserLendingPositions(llamalendUserSeed().user, llamalendUserSeed().chain, undefined, requestOptions),
  ),
  endpointCase('getUserMarketStats', () =>
    llamalend.getUserMarketStats(
      llamalendUserSeed().user,
      llamalendUserSeed().chain,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getMarketUsers', 'crvusd', () =>
    llamalend.getMarketUsers('crvusd', crvUsdMarketSeed().chain, crvUsdMarketSeed().controller, requestOptions),
  ),
  endpointCase('getMarketUsers', 'lending', () =>
    llamalend.getMarketUsers('lending', llamalendMarketSeed().chain, llamalendMarketSeed().controller, requestOptions),
  ),
  endpointCase('getUserMarketEarnings', () =>
    llamalend.getUserMarketEarnings(
      llamalendUserSeed().user,
      llamalendUserSeed().chain,
      llamalendUserSeed().vault,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketSnapshots', () =>
    llamalend.getUserMarketSnapshots(
      llamalendUserSeed().user,
      llamalendUserSeed().chain,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketCollateralEvents', () =>
    llamalend.getUserMarketCollateralEvents(
      llamalendUserSeed().user,
      llamalendUserSeed().chain,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
])
