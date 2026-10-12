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
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      { agg: 'day', fetch_on_chain: true, limit: 10 },
      requestOptions,
    ),
  ),
  endpointCase('getAllUserMarkets', () =>
    llamalend.getAllUserMarkets(llamalendUserSeed().user, undefined, requestOptions),
  ),
  endpointCase('getUserMarkets', () =>
    llamalend.getUserMarkets(llamalendUserSeed().user, llamalendUserSeed().blockchainId, undefined, requestOptions),
  ),
  endpointCase('getAllUserLendingPositions', () =>
    llamalend.getAllUserLendingPositions(llamalendUserSeed().user, undefined, requestOptions),
  ),
  endpointCase('getUserLendingPositions', () =>
    llamalend.getUserLendingPositions(
      llamalendUserSeed().user,
      llamalendUserSeed().blockchainId,
      undefined,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketStats', () =>
    llamalend.getUserMarketStats(
      llamalendUserSeed().user,
      llamalendUserSeed().blockchainId,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getMarketUsers', 'crvusd', () =>
    llamalend.getMarketUsers('crvusd', crvUsdMarketSeed().blockchainId, crvUsdMarketSeed().controller, requestOptions),
  ),
  endpointCase('getMarketUsers', 'lending', () =>
    llamalend.getMarketUsers(
      'lending',
      llamalendMarketSeed().blockchainId,
      llamalendMarketSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketEarnings', () =>
    llamalend.getUserMarketEarnings(
      llamalendUserSeed().user,
      llamalendUserSeed().blockchainId,
      llamalendUserSeed().vault,
      requestOptions,
    ),
  ),
  endpointCase('getMarketBorrowers', 'crvusd', () =>
    llamalend.getMarketBorrowers(crvUsdMarketSeed().blockchainId, crvUsdMarketSeed().controller, {
      ...requestOptions,
      endpoint: 'crvusd',
    }),
  ),
  endpointCase('getMarketBorrowers', 'lending', () =>
    llamalend.getMarketBorrowers(llamalendMarketSeed().blockchainId, llamalendMarketSeed().controller, requestOptions),
  ),
  endpointCase('getVaultDepositors', () =>
    llamalend.getVaultDepositors(llamalendMarketSeed().blockchainId, llamalendMarketSeed().vault, requestOptions),
  ),
  endpointCase('getVaultEvents', () =>
    llamalend.getVaultEvents(llamalendMarketSeed().blockchainId, llamalendMarketSeed().vault, requestOptions),
  ),
  endpointCase('getUserMarketSnapshots', () =>
    llamalend.getUserMarketSnapshots(
      llamalendUserSeed().user,
      llamalendUserSeed().blockchainId,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
  endpointCase('getUserMarketCollateralEvents', () =>
    llamalend.getUserMarketCollateralEvents(
      llamalendUserSeed().user,
      llamalendUserSeed().blockchainId,
      llamalendUserSeed().controller,
      requestOptions,
    ),
  ),
])
